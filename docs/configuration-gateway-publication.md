# Configuration Provider and Gateway articles

The owner authorized two separate issues and sequential PRs, followed by joint
publication. Configuration Provider already has a published URL; keep that URL.
PR #32 staged its revision under `docs/staged-articles`, outside the content
collections, and merged at `83bc868194e949bde773fc0f398346a8ed1d7604`. The second
PR moves that revision into its existing writing path, adds Gateway, and links
both from the PWI page. Main continues to deploy normally; the first merge left
the published article unchanged.

## Configuration Provider

- Issue: https://github.com/matlus/matlus.github.io/issues/30
- Canonical route: `/writing/configuration-provider-design-pattern/`.
- Sources: the owner-supplied canonical chapter and raw video transcript, read in
  full. Private manuscript links remain outside this public repository.
- Historical repository inspected at `065e56d66db4378914149db054665f789249ee40`:
  https://github.com/matlus/ConfigurationProviderNetFramework
- Composition repository inspected at `5014294a7240551034bbd69993b33c63b05602c7`:
  https://github.com/matlus/Process-Manager-Using-Pub-Sub
- The original retrieval excerpt matches its source. Other inline examples are
  explicitly reduced or self-contained teaching adaptations. They make aggregation
  and enum validation explicit instead of claiming that the sample already does
  both. The adapted enum omits the sample's `None` member.
- Hero: `configuration-provider-design-pattern-v2`, new technical editorial ink
  art. The old hero is preserved.
- Diagram: `configuration-provider-settings-flow.webp`, pastel illustrated data
  flow. The three arrows depict values moving through the provider and Manager;
  they do not depict method calls. Labels and endpoints were inspected.
- Metadata was extracted by a read-only sub-agent using the repository prompt.
  All selected tags already exist.

## Gateway

- Issue: https://github.com/matlus/matlus.github.io/issues/31
- Source video: https://www.youtube.com/watch?v=CABe1phGonw
- Source repository: https://github.com/matlus/Gateway-Example-YouTube
- Repository inspected at `7e22a6b94220abc0faf712fc162261a0ad589db6`.
- The owner-supplied chapter and raw transcript were read in full. The historical
  sample's matching client/server model shapes, incomplete REST year method and
  unhandled exception identifiers are qualified in the article.
- The asynchronous HTTP implementation is explicitly a teaching adaptation. Its
  blocks compiled together under .NET 10 with warnings treated as errors.
  Executed checks covered domain mapping, recognized/unknown/absent failure
  identifiers, malformed and null payloads, invalid title/year, unavailable
  service, timeout, caller cancellation and disposal of the owned transport.
  The checks supply HTTP responses at the transport; they retain the real Gateway.
- New hero and pastel boundary diagram have saved briefs. All four arrow routes,
  their labels and the application enclosure were inspected.
- Metadata was extracted by a read-only sub-agent. No new tags were necessary.
- Both source videos are public. Their verified original publication dates are
  August 11, 2019 (Configuration Provider) and July 28, 2019 (Gateway).

## Publication verification

Record example checks, site gates, PR identities, deployment SHA and source
cross-links here as each step completes.

The Configuration Provider teaching blocks were extracted and compiled together
under .NET 10 with `Microsoft.Extensions.Configuration` 10.0.0. Executed checks
covered valid typed output, the broker default, missing/empty/blank connection
strings, combined failures, numeric enum rejection and Boolean parsing/defaults.
Both prose audits report no findings on the revision. A temporary activation of
the staged article passed typecheck (0 errors, 0 warnings, 32 existing hints),
build, tag validation and generated local-link checks. The published source was
restored before committing the staging PR.

The joint publication build passed typecheck (0 errors, 0 warnings, 32 existing
hints), built 140 pages, indexed 139 pages, and passed tag and generated-link
checks. Both final articles and the PWI addition have no findings in either prose
audit. The whole repository copy audit has 0 hard violations and 29 existing
advisory findings outside the rewritten prose. Browser inspection confirmed the
article headings, hero placement, code blocks, captions and both PWI links.
The Markdown twins retain the explanatory diagram captions as text.

The standalone conversion brief is saved as
`prompts/transcript-to-standalone-teaching-article.md` for subsequent articles.
The image briefs are adjacent to their optimized WebP assets.
