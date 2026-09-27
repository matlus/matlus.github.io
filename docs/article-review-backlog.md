# Article review backlog

## Architecture with Intent topic overview

- [ ] Read the [October 29, 2012 transcript](https://docs.google.com/document/d/15XMR_su9_W864wGCH5LvgxGhu5IelHYf_Dk_wsYbcP0/edit).
  Its text export returned HTTP 401 on September 27, 2026. The owner supplied
  the original publication date and the current architectural explanation;
  the new overview uses that date with a September 27, 2026 revision date.
- [ ] Compare the [implementation recording](https://www.youtube.com/watch?v=t6i0XJQoKnY)
  with the overview when a transcript or recording review is available.
  YouTube oEmbed verified the public title, Layered Architecture Implementation
  Guidelines, and author, Shiv Kumar. No transcript was available for this pass.
  The owner's September 27 account takes precedence over either older recording.
- [ ] After the topic overview is published, verify its canonical URL and add
  the topic link to the matching public recording description. Keep the PWI
  homepage link. Do not infer an original recording ID from the private transcript.

The overview is authored separately at
`src/content/overviews/architecture-layers.md`. Its approved diagram is retained
as PNG, an optimized WebP, and the generation brief under `public/images/diagrams`.
The named drawing prompt is `prompts/generate-pastel-domain-architecture.md`.
The existing C# and Python corpus chapters are unchanged.

## Functional acceptance-testing series

- [ ] When the Meridian C# and Python repositories become public, verify their
  public URLs, add article-to-repository links, and add the corresponding article
  links to their READMEs. They remain private training references for now.
- [ ] Add links to the acceptance-testing chapters when those chapters are
  published. The current articles name the source chapters without broken links.

This file tracks editorial verification that has not yet been completed. It is
outside the site's content collections and is not published as an article or a
Markdown twin. Check off an item only after comparing the article with its
source material and recording the result in the reviewing PR.

## Design Nugget: Evolution To Strategy

- [ ] Compare each code excerpt in
  [the article](../src/content/writing/design-nugget-evolution-to-strategy.md)
  with the [recording](https://www.youtube.com/watch?v=RozqbM7C5sE) and the
  [four solution versions](https://github.com/matlus/DeisgnNuggetEvolutionToStrategy).
  Correct any mismatch in the article, or explain intentional adaptations in
  reader-facing prose where they affect interpretation.

## Factory Pattern

- [ ] Compare the thumbnailer excerpt in
  [the article](../src/content/writing/factory-pattern.md) with the
  [recording](https://www.youtube.com/watch?v=HQLXUyb0T2w). Confirm which
  details are adapted from the chapter draft and update the excerpt or its
  attribution if needed.

## Factory Method Pattern

- [ ] Compare the member-manager and Windows Forms examples in
  [the article](../src/content/writing/factory-method-pattern.md) with the
  [C# demonstration](https://www.youtube.com/watch?v=7q3T0gGISyk), then
  check the car-and-engine explanation against the
  [later discussion](https://www.youtube.com/watch?v=8PwI3yskj0I).
  Record any differences before changing example claims.

## Using Jev Compact LLM Context

- [ ] Recheck the three preserved TypeSafe documentation URLs for Noul,
  System One, and RAG passage classification. On 2026-09-25, HTTPS requests
  from this environment reported `CERTIFICATE_VERIFY_FAILED: certificate has expired`
  for all three. The article retains the supplied URLs. Its local links and
  downloadable examples resolve, and replaying the recorded response reproduces
  the published request, retained context, and 19.6% character reduction.
