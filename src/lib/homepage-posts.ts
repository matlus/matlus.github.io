interface HomepagePost {
  readonly id: string;
  readonly data: {
    readonly title: string;
    readonly datePublished: Date;
    readonly dateModified?: Date | undefined;
  };
}

/** Reading order; the homepage displays these parts last to first. */
const homepageSeries: readonly (readonly string[])[] = [
  [
    'verified-not-trusted-expense-analysis-part-one',
    'verified-not-trusted-expense-analysis-part-two',
    'verified-not-trusted-expense-analysis-part-three',
    'verified-not-trusted-expense-analysis-part-four',
  ],
  [
    'programming-to-exceptions-method-contracts',
    'programming-to-exceptions-diagnostics-and-boundaries',
    'programming-to-exceptions-logging-and-progress',
  ],
];

function latestDate(post: HomepagePost): number {
  return Math.max(post.data.datePublished.getTime(), post.data.dateModified?.getTime() ?? 0);
}

/** Place each uninterrupted series at its newest member's position in the feed. */
export function orderHomepagePosts<T extends HomepagePost>(posts: readonly T[]): T[] {
  const chronological = [...posts].sort((left, right) =>
    latestDate(right) - latestDate(left) ||
    right.data.datePublished.getTime() - left.data.datePublished.getTime() ||
    left.data.title.localeCompare(right.data.title),
  );
  const byId = new Map(posts.map((post) => [post.id, post]));
  const emitted = new Set<string>();
  const ordered: T[] = [];
  for (const post of chronological) {
    if (emitted.has(post.id)) continue;
    const series = homepageSeries.find((slugs) => slugs.includes(post.id));
    for (const slug of series ? [...series].reverse() : [post.id]) {
      const member = byId.get(slug);
      if (member === undefined) continue;
      ordered.push(member);
      emitted.add(slug);
    }
  }
  return ordered;
}
