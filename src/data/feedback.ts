/**
 * Settings for the site-wide message form.
 *
 * Messages go to a Cloudflare Worker (workers/feedback), which files each one
 * as an issue in a private GitHub repository. Both values below are public by
 * design: the endpoint is a URL every visitor's browser calls, and a Turnstile
 * site key only identifies the widget. The secrets live in the Worker.
 *
 * Until both are set, the form and its footer button are left out of the
 * build, so this can ship before the Worker exists. A build can override them
 * with PUBLIC_FEEDBACK_ENDPOINT and PUBLIC_TURNSTILE_SITE_KEY, which is how
 * the form is tested locally against a stand-in Worker.
 */
import { KINDS } from '../../workers/feedback/src/submission.js';

const PRODUCTION_ENDPOINT = 'https://matlus-feedback.shiv-kmr003.workers.dev/';
const PRODUCTION_TURNSTILE_SITE_KEY = '0x4AAAAAAFTcM6oO5qMglmeJ';

const env = import.meta.env;

export const FEEDBACK_ENDPOINT: string = env['PUBLIC_FEEDBACK_ENDPOINT'] || PRODUCTION_ENDPOINT;
export const TURNSTILE_SITE_KEY: string = env['PUBLIC_TURNSTILE_SITE_KEY'] || PRODUCTION_TURNSTILE_SITE_KEY;

export const FEEDBACK_ENABLED = FEEDBACK_ENDPOINT !== '' && TURNSTILE_SITE_KEY !== '';

/** The Worker validates against the same list, so the two cannot drift. */
export const FEEDBACK_KINDS = Object.entries(KINDS).map(([value, label]) => ({ value, label }));
