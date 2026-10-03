# Article review backlog

## Recovered Matlus articles, October 3, 2026

These are historical source limitations, retained under Shiv's instruction to
republish the original prose and code. They are not conversion corrections or
claims that the old examples have been tested against current frameworks.

- Four image captures were unavailable: one Azure startup image and three MSMQ
  images. Their replacements illustrate the surviving text. The missing MSMQ
  encoding setting remains unspecified rather than guessed.
- Some source captures already contain Unicode replacement characters. The
  immutable archive and publication text preserve those characters.
- Cross-domain CRUD contains an empty background section and an unfinished HTML
  example sentence. Self-host Web API refers to a later listing absent from the
  captured body. Retain both pending a separate source-recovery request.
- WCF Getting Started uses differing MEX port numbers in its prose and code.
  Data Access Layer Codegen has inconsistent generated member names and a
  stored-procedure dispatch that merits review. DataReader Wrappers has differing
  BlogItem and BlogItemDrw identifiers. Original code remains intact.
- The HttpApplication discussion and OAuth terminology retain their historical
  technical claims. Future modernization must be a separate editorial decision.
- Benchmark figures and browser comparisons describe historical observations.
  New artwork reconstructs the captured values; it supplies no new measurements.
- Historical downloads, demo endpoints, videos mentioned within the prose, and
  external references retain their archived URLs. Their availability is unverified;
  no replacement repository or YouTube association has been invented.
- HTML5 Video and Flash links to feature capability/performance sections that do
  not exist in the capture. Those fragments now point to the corresponding items
  in its introductory comparison list. Other broken fragments and duplicate anchor
  IDs were repaired without changing visible text.

Publication evidence and the per-article register live in
`docs/recovered-articles-publication-plan.md` and `docs/recovered-articles/`.

## Programming to Exceptions publication

- [x] Apply the October 2 editorial decisions to both articles. Customer retrieval
  and order placement use distinct concrete exceptions. The happy-path comparison
  is explicitly a teaching adaptation, and boundary handler is defined as
  exception-handling middleware in a Web API before its first diagram.
- [x] Place six diagrams, including the owner's hierarchy and approved order
  comparison, with alt text, captions, full-size links, and retained prompts.
  Add both article heroes and remove the two optional image planning notes.
- [x] Run the required metadata sub-agent against the finished pair. Keep the
  existing Part 1 tags; add Structured Logging to Part 2 with a distinct topic
  hero and prompt. Try-Parse remains covered by the existing Design Patterns tag.
- [x] Verify the shared public recording's calendar date as October 28, 2019.
  Both articles use that date, an October 2, 2026 modification date, and the same
  YouTube resource. The article bodies stand independently of the recording.
- [x] Compile the current complete C# foundations and both exact order comparison
  listings. Exercise all six failure positions, both successful paths, copied
  context, authoritative policy fields, cause preservation, HTTP failure records,
  diagnostic JSON, and boundary enrichment.
- [x] Verify the exact `origin/main` deployment, both live canonical URLs, and the
  saved YouTube description backlinks. Execution evidence belongs in
  `docs/programming-to-exceptions-publication-plan.md`.
- [ ] When the Meridian sample-code repository becomes public, verify its URL
  and add article-to-repository and README-to-article links. The current examples
  explain their behavior without requiring access to that private repository.

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

## Method Design

- [x] Compare the owner-supplied 58-slide Method Design Guidelines deck with the published C# Method Design chapter. The September 28, 2026 revision adds honest input and return types, typed domain arguments, argument order, need-to-know, Rule of Thirds, and the deck's cast-versus-`as` examples. The owner clarified that a cast states an expected type and leaves an unexpected mismatch to the caller, while `as` is justified only when this method has a defined response to `null`. It links to Naming, LINQ, Validation, Type Casting, and Strategy for their broader treatments while keeping the method-design decisions in this chapter.
- [ ] Compare the revised C# chapter with the full narration from the [public Part 1 recording](https://www.youtube.com/watch?v=-13KJSZuR9k) and identify any Part 2 recording that uses the same deck. The owner supplied a raw Part 1 transcript: it confirms the need-to-know explanation and the third-use pause, and mentions cast-versus-`as` only as an example of an assumption to examine. It does not walk through deck slides 45–47. In particular, check the qualifications behind deck slides 33–34 (strings), 42–44 (configuration), 54 (typed value objects), and 58 (polymorphism versus a finite `switch`).
- [ ] Check the deck's direct cast of `GetCustomAttributes(Type, bool)` across the historical runtime used in the presentation. The current .NET API documentation promises `object[]` or an empty array; a local runtime check returned `CodeMappingAttribute[]`, but the article qualifies the slide's array-type assumption and shows the typed generic overload as the portable contract.
- [ ] Confirm the historical examples against the recording before presenting their code as a working implementation. The snippets on deck slides 12 and 39 use names absent from their shown parameters, and the forward-removal loop on slide 52 can skip an element. The chapter replaces the last of these with a self-contained teaching example and explains the defect.
- [ ] Develop the deck's local C# implementation choices into a separate style article if the recording supports them: variable scope, deliberate initialization, `var`, and avoidable allocations on slide 41. These points are only summarized where they affect a method's contract today. Add a Method Design link after that article is published, so the site has no placeholder URL.
- [ ] Review the reference implementation's `GatewayEmailService.AttemptSendAsync` (`EmailSendFailure?`) and `ManagerOrdering.TryPublishFulfillmentNotificationAsync` (`DateTime?`) against the owner's action-method rule. The September 27 chapter revision used these implementation details to justify nullable action returns, but slides 23–25 do not establish that exception. The chapter now teaches no-match results only for `Find`/`Search` queries; any code-design decision belongs in the implementation's own review.

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

- [x] Read the complete owner-supplied raw transcript and book chapter on
  September 27, 2026. Restore the central explanation of programming to an
  interface at the call site: the base-typed variable, its public contract,
  uniform use of descendants, and Factory-owned selection and construction.
  The transcript also covers designing from the call site, the public method
  and protected abstract core, business identifiers, stateless construction,
  repeated runtime decisions, Strategy and Factory Method distinctions, and
  naming. Each is represented in the revised article.
- The thumbnailer code is a complete, reduced teaching implementation. Its
  console output makes dispatch observable, replacing the earlier incomplete
  `Image`-returning excerpt. The inline blocks compiled together under .NET 10
  with warnings treated as errors. Executed checks covered the exact article
  call site, all three media selections and unsupported identifiers. No claim
  of exact historical source-code reproduction is made.

## Factory Method Pattern

- On September 27, 2026, recording narration was recast as direct explanations.
  The existing member-manager, Windows Forms and car/engine relationships were
  preserved. The reduced car example now defines both engine descendants and
  its base-typed consumer inline; compiled checks covered overridden and default
  creation hooks. These checks exercise the reduced teaching implementation;
  historical code comparisons remain pending below.
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
