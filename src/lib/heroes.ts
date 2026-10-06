/**
 * Resolve a named hero from the optimized asset directory.
 * Content and dynamic section routes carry slugs rather than import paths.
 */
const heroes = import.meta.glob<{ default: ImageMetadata }>('../assets/heroes/*.webp', {
  eager: true,
});

export function heroFor(slug: string): ImageMetadata | undefined {
  const key = Object.keys(heroes).find((path) => path.endsWith(`/${slug}.webp`));
  return key ? heroes[key]?.default : undefined;
}

/** A companion uses the hero's asset name, which can differ from the article slug. */
export function cardImageFor(hero: ImageMetadata): ImageMetadata | undefined {
  const source = Object.keys(heroes).find((key) => heroes[key]?.default.src === hero.src);
  return source ? heroes[source.replace(/\.webp$/, '-card.webp')]?.default : undefined;
}
