# Configuration Provider and Gateway articles

The owner authorized two separate issues and sequential PRs, followed by joint
publication. Configuration Provider already has a published URL; keep that URL.
The first PR stages its revision under `docs/staged-articles`, outside the content
collections. The second PR moves that revision into its existing writing path,
adds Gateway, and links both from the PWI page. Main continues to deploy normally;
the first merge leaves the published article unchanged.

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
