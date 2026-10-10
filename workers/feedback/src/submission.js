// Validation and issue formatting for site feedback.
//
// Kept free of Worker and network APIs so `node --test` can exercise it
// directly. The Worker entry point in index.js wires it to HTTP.

/** The kinds a visitor can choose. Each becomes a label on the issue. */
export const KINDS = Object.freeze({
  question: 'Question',
  suggestion: 'Suggestion',
  opportunity: 'Work opportunity',
  other: 'Something else',
});

export const LIMITS = Object.freeze({
  name: 120,
  email: 254,
  message: 5000,
  url: 2000,
  title: 300,
});

// Deliberately loose. The goal is to catch typos such as a missing "@",
// not to decide which addresses are deliverable.
const EMAIL = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]+$/;

/**
 * @typedef {object} Submission
 * @property {keyof typeof KINDS} kind
 * @property {string} name
 * @property {string} email
 * @property {string} message
 * @property {{ url: string, title: string }} page
 * @property {{ referrer: string, url: string, at: string }} landing
 */

/**
 * @param {unknown} value
 * @param {number} max
 */
function text(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Check and normalise the JSON a visitor's browser sent.
 *
 * @param {unknown} input
 * @returns {{ ok: true, submission: Submission } | { ok: false, errors: Record<string, string> }}
 */
export function parseSubmission(input) {
  const body = input && typeof input === 'object' ? /** @type {Record<string, any>} */ (input) : {};
  /** @type {Record<string, string>} */
  const errors = {};

  const kind = typeof body.kind === 'string' && Object.hasOwn(KINDS, body.kind) ? body.kind : '';
  if (!kind) errors.kind = 'Choose what your message is about.';

  const name = text(body.name, LIMITS.name);

  const email = text(body.email, LIMITS.email);
  if (email && !EMAIL.test(email)) errors.email = 'Check the email address.';

  const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';
  if (!rawMessage) errors.message = 'Write a message.';
  else if (rawMessage.length > LIMITS.message) errors.message = `Keep the message under ${LIMITS.message} characters.`;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const page = body.page && typeof body.page === 'object' ? body.page : {};
  const landing = body.landing && typeof body.landing === 'object' ? body.landing : {};

  return {
    ok: true,
    submission: {
      kind: /** @type {keyof typeof KINDS} */ (kind),
      name,
      email,
      message: rawMessage,
      page: { url: text(page.url, LIMITS.url), title: text(page.title, LIMITS.title) },
      landing: {
        referrer: text(landing.referrer, LIMITS.url),
        url: text(landing.url, LIMITS.url),
        at: text(landing.at, 40),
      },
    },
  };
}

/** UTM parameters from the landing URL, which outlast a stripped referrer. */
export function campaignFrom(landingUrl) {
  /** @type {Record<string, string>} */
  const found = {};
  try {
    for (const [key, value] of new URL(landingUrl).searchParams) {
      if (key.startsWith('utm_') && value) found[key] = value;
    }
  } catch {
    // A missing or relative landing URL simply has no campaign.
  }
  return found;
}

// A URL GitHub can show as a link without escaping. Anything else is text.
const PLAIN_URL = /^https?:\/\/[^\s<>|`]+$/;

/** Text safe inside a single Markdown table cell. */
function cell(value) {
  if (!value) return '_none_';
  if (PLAIN_URL.test(value)) return `<${value}>`;
  return value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ').replace(/[<>`*_[\]]/g, '\\$&');
}

/** A fence longer than any backtick run in the content, so it cannot be closed early. */
function fence(content) {
  const longest = Math.max(0, ...Array.from(content.matchAll(/`+/g), (m) => m[0].length));
  return '`'.repeat(Math.max(3, longest + 1));
}

/**
 * Build the GitHub issue for one submission.
 *
 * @param {Submission} submission
 * @param {{ receivedAt: string, country?: string, userAgent?: string }} context
 *   Facts the Worker observed itself, rather than ones the browser claimed.
 */
export function buildIssue(submission, context) {
  const { kind, name, email, message, page, landing } = submission;
  const who = name || email || 'Anonymous';
  const firstLine = message.split(/\r?\n/, 1)[0] ?? '';
  const summary = firstLine.length > 60 ? `${firstLine.slice(0, 57).trimEnd()}...` : firstLine;
  const campaign = campaignFrom(landing.url);

  const rows = [
    ['Kind', KINDS[kind]],
    ['Name', name],
    ['Email', email],
    ['Sent from page', page.url],
    ['Page title', page.title],
    ['First referrer', landing.referrer || '(none: direct visit, app, or referrer withheld)'],
    ['Landing page', landing.url],
    ['Landed at', landing.at],
    ['Campaign', Object.entries(campaign).map(([k, v]) => `${k}=${v}`).join(', ')],
    ['Received', context.receivedAt],
    ['Country', context.country ?? ''],
    ['Browser', context.userAgent ?? ''],
  ];

  const record = JSON.stringify({ ...submission, campaign, received: context }, null, 2);
  const recordFence = fence(record);

  const body = [
    email ? `Reply to: <mailto:${email}>` : '_No email given._',
    '',
    '| Field | Value |',
    '| --- | --- |',
    ...rows.map(([label, value]) => `| ${label} | ${cell(value ?? '')} |`),
    '',
    '### Message',
    '',
    message.split(/\r?\n/).map((line) => `> ${line}`).join('\n'),
    '',
    '<details><summary>Raw submission (JSON)</summary>',
    '',
    `${recordFence}json`,
    record,
    recordFence,
    '',
    '</details>',
  ].join('\n');

  return {
    title: `${KINDS[kind]} from ${who}: ${summary}`.replace(/[\r\n]+/g, ' ').slice(0, 256),
    body,
    labels: [kind],
  };
}
