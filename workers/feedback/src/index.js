// Cloudflare Worker that receives the matlus.com feedback form and files each
// submission as an issue in a private GitHub repository.
//
// Configuration (see README.md):
//   vars:    ALLOWED_ORIGINS, GITHUB_OWNER, GITHUB_REPO
//   secrets: GITHUB_TOKEN, TURNSTILE_SECRET_KEY

import { buildIssue, parseSubmission } from './submission.js';

const MAX_BODY_CHARS = 32 * 1024;
const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
export const TURNSTILE_ACTION = 'feedback';

/**
 * @typedef {object} Env
 * @property {string} ALLOWED_ORIGINS  Comma-separated, e.g. "https://matlus.com".
 * @property {string} GITHUB_OWNER
 * @property {string} GITHUB_REPO
 * @property {string} GITHUB_TOKEN
 * @property {string} TURNSTILE_SECRET_KEY
 */

/**
 * @param {unknown} body
 * @param {number} status
 * @param {Record<string, string>} headers
 */
function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

/** @param {Env} env */
function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * @param {string} token
 * @param {string} ip
 * @param {Env} env
 */
async function verifyTurnstile(token, ip, env) {
  if (!token) return false;
  const form = new FormData();
  form.set('secret', env.TURNSTILE_SECRET_KEY);
  form.set('response', token);
  if (ip) form.set('remoteip', ip);

  const response = await fetch(TURNSTILE_VERIFY, { method: 'POST', body: form });
  if (!response.ok) return false;
  const outcome = /** @type {{ success?: boolean, action?: string }} */ (await response.json());
  return outcome.success === true && outcome.action === TURNSTILE_ACTION;
}

/**
 * @param {{ title: string, body: string, labels: string[] }} issue
 * @param {Env} env
 */
async function createIssue(issue, env) {
  return fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'content-type': 'application/json',
      'user-agent': 'matlus-feedback-worker',
      'x-github-api-version': '2022-11-28',
    },
    body: JSON.stringify(issue),
  });
}

export default {
  /**
   * @param {Request} request
   * @param {Env} env
   */
  async fetch(request, env) {
    const origin = request.headers.get('origin') ?? '';
    if (!allowedOrigins(env).includes(origin)) {
      return json({ ok: false, error: 'origin' }, 403, {});
    }

    const cors = {
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400',
      vary: 'origin',
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405, cors);

    const raw = await request.text();
    if (raw.length > MAX_BODY_CHARS) return json({ ok: false, error: 'too-large' }, 413, cors);

    /** @type {any} */
    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      return json({ ok: false, error: 'invalid-json' }, 400, cors);
    }

    // Bots fill every field, including the one people never see. Report
    // success so they have no reason to adapt.
    if (typeof input?.website === 'string' && input.website.trim() !== '') {
      return json({ ok: true }, 200, cors);
    }

    const parsed = parseSubmission(input);
    if (!parsed.ok) return json({ ok: false, error: 'invalid', fields: parsed.errors }, 400, cors);

    const ip = request.headers.get('cf-connecting-ip') ?? '';
    const human = await verifyTurnstile(String(input?.turnstileToken ?? ''), ip, env);
    if (!human) return json({ ok: false, error: 'challenge' }, 403, cors);

    const cf = /** @type {{ country?: string } | undefined} */ (/** @type {any} */ (request).cf);
    const issue = buildIssue(parsed.submission, {
      receivedAt: new Date().toISOString(),
      ...(cf?.country ? { country: cf.country } : {}),
      userAgent: request.headers.get('user-agent') ?? '',
    });

    const created = await createIssue(issue, env);
    if (!created.ok) {
      // Keep the message in the Worker's logs so it can be recovered by hand
      // even though it never reached the inbox.
      console.error('GitHub rejected the issue', created.status, await created.text(), JSON.stringify(issue));
      return json({ ok: false, error: 'storage' }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  },
};
