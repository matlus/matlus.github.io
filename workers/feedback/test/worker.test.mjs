import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import worker, { TURNSTILE_ACTION } from '../src/index.js';
import { buildIssue, campaignFrom, parseSubmission } from '../src/submission.js';

const env = {
  ALLOWED_ORIGINS: 'https://matlus.com, http://localhost:4321',
  GITHUB_OWNER: 'matlus',
  GITHUB_REPO: 'site-inbox',
  GITHUB_TOKEN: 'test-token',
  TURNSTILE_SECRET_KEY: 'test-secret',
};

const valid = {
  kind: 'opportunity',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'We are hiring an architect.\nCan we talk?',
  website: '',
  turnstileToken: 'token-123',
  page: { url: 'https://matlus.com/about/', title: 'About | Matlus' },
  landing: {
    referrer: 'https://www.linkedin.com/',
    url: 'https://matlus.com/writing/jev-practical-reference/?utm_source=linkedin&utm_medium=social',
    at: '2026-10-10T14:00:00.000Z',
  },
};

/** @param {unknown} body @param {string} [origin] @param {string} [method] */
function request(body, origin = 'https://matlus.com', method = 'POST') {
  return new Request('https://matlus-feedback.example.workers.dev/', {
    method,
    headers: { origin, 'content-type': 'application/json', 'user-agent': 'TestBrowser/1.0' },
    ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
}

describe('parseSubmission', () => {
  it('accepts a complete submission and trims fields', () => {
    const result = parseSubmission({ ...valid, name: '  Ada  ' });
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.submission.name, 'Ada');
  });

  it('allows name and email to be left out', () => {
    const result = parseSubmission({ kind: 'question', message: 'Hello' });
    assert.equal(result.ok, true);
  });

  it('reports each invalid field', () => {
    const result = parseSubmission({ kind: 'spam', email: 'not-an-email', message: '  ' });
    assert.equal(result.ok, false);
    assert.deepEqual(Object.keys(result.ok ? {} : result.errors).sort(), ['email', 'kind', 'message']);
  });

  it('rejects a kind inherited from Object.prototype', () => {
    assert.equal(parseSubmission({ kind: 'toString', message: 'x' }).ok, false);
  });

  it('rejects an overlong message', () => {
    assert.equal(parseSubmission({ kind: 'other', message: 'x'.repeat(5001) }).ok, false);
  });
});

describe('campaignFrom', () => {
  it('keeps only utm parameters', () => {
    assert.deepEqual(campaignFrom('https://matlus.com/?utm_source=linkedin&x=1'), { utm_source: 'linkedin' });
  });

  it('returns nothing for an unusable URL', () => {
    assert.deepEqual(campaignFrom(''), {});
  });
});

describe('buildIssue', () => {
  const parsed = parseSubmission(valid);
  assert.ok(parsed.ok);
  const issue = buildIssue(parsed.submission, { receivedAt: '2026-10-10T14:05:00.000Z', country: 'US' });

  it('labels the issue with its kind and names the sender in the title', () => {
    assert.deepEqual(issue.labels, ['opportunity']);
    assert.equal(issue.title, 'Work opportunity from Ada Lovelace: We are hiring an architect.');
  });

  it('records the page, first referrer and campaign', () => {
    assert.match(issue.body, /\| Sent from page \| <https:\/\/matlus\.com\/about\/> \|/);
    assert.match(issue.body, /\| Page title \| About \\\| Matlus \|/);
    assert.match(issue.body, /\| First referrer \| <https:\/\/www\.linkedin\.com\/> \|/);
    assert.match(issue.body, /\| Landing page \| <https:\/\/matlus\.com\/writing\/jev-practical-reference\/\?utm_source=linkedin&utm_medium=social> \|/);
    assert.match(issue.body, /utm\\_source=linkedin, utm\\_medium=social/);
    assert.match(issue.body, /Reply to: <mailto:ada@example\.com>/);
  });

  it('quotes every message line', () => {
    assert.match(issue.body, /> We are hiring an architect\.\n> Can we talk\?/);
  });

  it('keeps a fenced message from closing the raw JSON block', () => {
    const fenced = parseSubmission({ ...valid, message: 'look ````` here' });
    assert.ok(fenced.ok);
    const body = buildIssue(fenced.submission, { receivedAt: 'now' }).body;
    assert.match(body, /\n``````json\n/);
  });

  it('keeps newlines out of table cells', () => {
    const odd = parseSubmission({ ...valid, page: { url: 'https://matlus.com/a|b', title: 'a\n| b' } });
    assert.ok(odd.ok);
    const body = buildIssue(odd.submission, { receivedAt: 'now' }).body;
    assert.match(body, /\| Page title \| a \\\| b \|/);
    assert.match(body, /\| Sent from page \| https:\/\/matlus\.com\/a\\\|b \|/);
  });
});

describe('worker.fetch', () => {
  /** @type {typeof fetch} */
  const realFetch = globalThis.fetch;
  /** @type {{ url: string, init: RequestInit | undefined }[]} */
  let calls;
  let turnstile;
  let github;

  beforeEach(() => {
    calls = [];
    turnstile = { success: true, action: TURNSTILE_ACTION };
    github = { status: 201 };
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.includes('turnstile')) return Response.json(turnstile);
      if (url.includes('api.github.com')) return new Response('{}', { status: github.status });
      throw new Error(`unexpected fetch ${url}`);
    };
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('refuses an unknown origin', async () => {
    const response = await worker.fetch(request(valid, 'https://evil.example'), env);
    assert.equal(response.status, 403);
    assert.equal(calls.length, 0);
  });

  it('answers the CORS preflight for an allowed origin', async () => {
    const response = await worker.fetch(request(null, 'http://localhost:4321', 'OPTIONS'), env);
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:4321');
  });

  it('files a valid submission as an issue', async () => {
    const response = await worker.fetch(request(valid), env);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });

    const githubCall = calls.find((call) => call.url.includes('api.github.com'));
    assert.ok(githubCall);
    assert.equal(githubCall.url, 'https://api.github.com/repos/matlus/site-inbox/issues');
    const headers = /** @type {Record<string, string>} */ (githubCall.init?.headers);
    assert.equal(headers.authorization, 'Bearer test-token');
    const sent = JSON.parse(String(githubCall.init?.body));
    assert.deepEqual(sent.labels, ['opportunity']);
    assert.match(sent.body, /TestBrowser\/1\.0/);
  });

  it('drops honeypot submissions quietly', async () => {
    const response = await worker.fetch(request({ ...valid, website: 'http://spam' }), env);
    assert.equal(response.status, 200);
    assert.equal(calls.length, 0);
  });

  it('rejects a failed challenge before writing anything', async () => {
    turnstile = { success: false };
    const response = await worker.fetch(request(valid), env);
    assert.equal(response.status, 403);
    assert.ok(calls.every((call) => !call.url.includes('api.github.com')));
  });

  it('rejects a challenge token issued for another action', async () => {
    turnstile = { success: true, action: 'login' };
    const response = await worker.fetch(request(valid), env);
    assert.equal(response.status, 403);
  });

  it('returns field errors without checking the challenge', async () => {
    const response = await worker.fetch(request({ ...valid, message: '' }), env);
    assert.equal(response.status, 400);
    assert.deepEqual(Object.keys((await response.json()).fields), ['message']);
    assert.equal(calls.length, 0);
  });

  it('rejects malformed JSON and oversized bodies', async () => {
    assert.equal((await worker.fetch(request('{oops'), env)).status, 400);
    assert.equal((await worker.fetch(request('x'.repeat(40_000)), env)).status, 413);
  });

  it('reports a storage failure so the visitor can try again', async (t) => {
    github = { status: 401 };
    t.mock.method(console, 'error', () => {});
    const response = await worker.fetch(request(valid), env);
    assert.equal(response.status, 502);
  });
});
