import assert from 'node:assert/strict';
import test from 'node:test';
import { openExternalLinksInNewTabs } from '../src/lib/external-links.ts';

const site = new URL('https://matlus.com');
const render = (content) => openExternalLinksInNewTabs(`<!doctype html><html><head></head><body>${content}</body></html>`, site);

test('external web destinations open new tabs, including protocol-relative URLs', () => {
  for (const href of ['https://learn.microsoft.com/dotnet/', 'http://example.com/', '//github.com/matlus', 'https://matlus.com.example.org/']) {
    const html = render(`<a href="${href}">Reference</a>`);
    assert.ok(html.includes(`href="${href}" target="_blank" rel="noopener noreferrer"`));
  }
});

test('internal, fragment, email and telephone links keep their behavior', () => {
  for (const href of ['/writing/example/', '../example/', '#section', 'https://matlus.com/writing/example/', 'mailto:author@example.com', 'tel:+15551234567']) {
    assert.ok(render(`<a href="${href}">Link</a>`).includes(`<a href="${href}">Link</a>`));
  }
});

test('replaces explicit same-tab targets and removes opener while keeping other relations', () => {
  const html = render('<a href="https://github.com/matlus" target="_self" rel="nofollow UGC opener">Code</a>');
  assert.ok(html.includes('target="_blank" rel="nofollow ugc noopener noreferrer"'));
});

test('raw HTML links and template links receive the same policy', () => {
  const html = render('<section><A HREF="https://example.com/?a=1&amp;b=2"><strong>Read</strong></A></section><template><a href="https://example.net/">Next</a></template>');
  assert.equal((html.match(/target="_blank"/g) ?? []).length, 2);
  assert.ok(html.includes('https://example.com/?a=1&amp;b=2'));
  assert.ok(html.includes('<strong>Read</strong>'));
});

test('literal code and script strings are never treated as hyperlinks', () => {
  const code = '<pre><code>&lt;a href="https://example.com"&gt;Example&lt;/a&gt;</code></pre>';
  const script = '<script>const example = \'<a href="https://example.com">\';</script>';
  const html = render(code + script);
  assert.ok(html.includes(code));
  assert.ok(html.includes(script));
  assert.ok(!html.includes('target="_blank"'));
});

test('repeated rendering does not duplicate attributes or relationship tokens', () => {
  const once = render('<a href="https://example.com/" target="_blank" rel="noopener noreferrer">Read</a>');
  assert.equal(openExternalLinksInNewTabs(once, site), once);
});
