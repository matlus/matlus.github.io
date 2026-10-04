import { parse, serialize } from 'parse5';
import type { DefaultTreeAdapterTypes } from 'parse5';

type HtmlNode = DefaultTreeAdapterTypes.Node;
type HtmlElement = DefaultTreeAdapterTypes.Element;

function isExternalWebLink(href: string, site: URL): boolean {
  let destination: URL;
  try {
    destination = new URL(href, site);
  } catch {
    return false;
  }
  return (destination.protocol === 'https:' || destination.protocol === 'http:') &&
    destination.origin !== site.origin;
}

function setAttribute(element: HtmlElement, name: string, value: string): void {
  const existing = element.attrs.find((attribute) => attribute.name === name);
  if (existing) {
    existing.value = value;
  } else {
    element.attrs.push({ name, value });
  }
}

function updateLinks(node: HtmlNode, site: URL): void {
  if ('tagName' in node && node.tagName === 'a') {
    const href = node.attrs.find((attribute) => attribute.name === 'href')?.value;
    if (href !== undefined && isExternalWebLink(href, site)) {
      const existingRel = node.attrs.find((attribute) => attribute.name === 'rel')?.value ?? '';
      const relations = new Set(existingRel.toLowerCase().split(/\s+/).filter((value) => value && value !== 'opener'));
      relations.add('noopener');
      relations.add('noreferrer');
      setAttribute(node, 'target', '_blank');
      setAttribute(node, 'rel', [...relations].join(' '));
    }
  }
  if ('childNodes' in node) {
    for (const child of node.childNodes) updateLinks(child, site);
  }
  if ('content' in node) updateLinks(node.content, site);
}

/** Apply the site policy to Markdown, raw HTML and component links together. */
export function openExternalLinksInNewTabs(html: string, site: URL): string {
  const document = parse(html);
  updateLinks(document, site);
  return serialize(document);
}
