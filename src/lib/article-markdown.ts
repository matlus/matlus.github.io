/** Keep diagram explanations in text feeds and decode lossless source entities. */
export function readableArticleBody(body: string | undefined): string {
  return (body ?? '')
    .replace(/<!-- audit-allow: [^\n]+ -->\n/g, '')
    .replace(
      /<!-- diagram:start ([a-z0-9-]+) -->[\s\S]*?<!-- diagram:end \1 -->/g,
      (diagram: string): string => {
        const caption = diagram.match(/<figcaption>([^<]+)<\/figcaption>/)?.[1];
        return caption ? `> Diagram: ${caption}` : '';
      },
    )
    .replaceAll('&#8212;', '—')
    .replaceAll('&#8230;', '…');
}
