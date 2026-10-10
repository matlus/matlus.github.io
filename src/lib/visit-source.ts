/**
 * Remember how a visitor first arrived, for the message form.
 *
 * The browser reports a referrer only for the page it loaded from another
 * site. After one click inside matlus.com, document.referrer names our own
 * page. So the first page of a visit records the referrer and landing URL in
 * sessionStorage, and the form reads that record however many pages later the
 * visitor writes. sessionStorage lasts for the tab and is never sent to any
 * server, unlike a cookie.
 */

const KEY = 'matlus:landing';

export interface Landing {
  /** The referrer of the first page, often only the origin, or empty. */
  readonly referrer: string;
  /** Full URL of the first page, including any utm_ parameters. */
  readonly url: string;
  readonly at: string;
}

export function recordLanding(): void {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const landing: Landing = {
      referrer: document.referrer,
      url: location.href.split('#')[0] ?? location.href,
      at: new Date().toISOString(),
    };
    sessionStorage.setItem(KEY, JSON.stringify(landing));
  } catch {
    // Storage can be disabled or full. The form then sends no landing record.
  }
}

export function readLanding(): Landing | undefined {
  try {
    const stored = sessionStorage.getItem(KEY);
    return stored ? (JSON.parse(stored) as Landing) : undefined;
  } catch {
    return undefined;
  }
}
