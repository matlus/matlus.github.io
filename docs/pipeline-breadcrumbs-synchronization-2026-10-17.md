# Pipeline Breadcrumbs source synchronization

Prepared October 17, 2026 for **Logs and Artifacts: Pipeline Breadcrumbs** at
`src/content/writing/pipeline-breadcrumbs.md`. The owner authorized commit, push, PR and merge.
The public URL remains `/writing/pipeline-breadcrumbs/`.

## Source and scope

The article previously pinned source revision
`13c6b48bfb089c0de7f7c894488205a61d967eb6`. It now pins public `main` at
`ccdc37fa80cd54e8bbcbc9f6ed12e8cb2c09bf30` in
[Pipeline Breadcrumbs](https://github.com/matlus/pipeline-breadcrumbs).
The latest merged source reviews include PRs #3, #7 and #8.

Inspected implementations support these corrections:

- Hosting and testing sink names are `ArtifactSinkFileSystem`,
  `ArtifactSinkBlobStorage` and `ArtifactSinkTesting`.
- The blob sink accepts one directory representing the run's blob prefix.
- The detector excerpt calls `_gateway_model_service.detect_section`.
- The demo and acceptance tests retain `GatewayModelService` and substitute its
  HTTP transport through their service locators. The demo uses an in-process
  `ModelServiceSimulator`; tests use a Test Mediator.
- Steps and artifact emission require an open work item. The demo handles a
  manifest-persistence failure at the outer run boundary and reports failure.

The user requested greater vertical gaps between flow levels and smooth curved
arrows as a convention for future diagrams, then clarified that this article's
mainly horizontal diagrams should remain unchanged. Both article SVGs are restored
exactly to their baseline versions: steps is 1100 by 480; hosting is 1100 by 470.
The image guide and all four shared diagram prompts retain the convention for
future flow diagrams. No Breadcrumbs diagram changes remain in this revision.

The title, frontmatter, headings, anchors, approved hero and card are retained.
All frontmatter remains unchanged. Both date fields
remain present with these exact values:

| Field | Before | After |
|---|---|---|
| `datePublished` | `2026-10-05` | `2026-10-05` |
| `dateModified` | `2026-10-05` | `2026-10-05` |

## Part Four diagram refinement

The same publication includes the owner's approved layout changes to
`expense-analysis-eval-anatomy.svg` and `expense-analysis-two-verifications.svg`.
The canvases are 720 by 1640 and 720 by 1175, with larger vertical gaps between
rows. Directly aligned vertical arrows are straight and perpendicular to the box
edges; offset paths use smooth curves. All connectors start and finish at the
centers of the appropriate edges. Branches and merges share anchors, including
the reference-key split into the two graders and their convergence into the
pass-rate box.

The diagrams retain their exact labels, colours, box dimensions and relationships.
Part Four's article text, hero, card and both `2026-10-12` dates remain unchanged.
Geometry checks compare protected SVG elements, confirm six aligned arrows were
straightened, and verify centered endpoints. Desktop and phone renderings were
inspected; phone figures retain their established horizontal scrolling.
The final checked assets match the primary checkout's approved SVG bytes.
Evidence is retained under
`D:/Source/Workspaces/matlus-expense-diagram-spacing-2026-10-17/`.

## Editorial checks

Used the repository blog-writing skill. A fresh reviewer read the complete
baseline and current source without earlier editorial conclusions. All six
source synchronization findings were verified and accepted. A second fresh
reviewer compared the complete baseline and candidate before reading the findings
and dispositions: **improved**, with no source-backed regression. Its diagram
comparison predates the owner's clarification; those layout edits were subsequently
reverted, and both SVGs match the baseline. Both reviews record all thirteen article headings and
the closing sentence. Independent metadata extraction supports the existing
175-character description and all six tags; no new tags or artwork are needed.

The review and comparison prompts are the unchanged versions at site baseline
`6f2e87d60139f7ca3907b495a5b9a76e8be1ad05`. Full packets, findings, dispositions,
comparison, metadata and logs are retained outside the repository under
`D:/Source/Workspaces/matlus-breadcrumbs-sync-2026-10-17/`.

## Verification

- Source acceptance suite: **144 passed** against the new pin.
- The complete runnable article example was extracted and executed. Its two exact
  page texts, completed manifest and log boundaries match the article. Pyright
  reports zero errors or warnings for the extracted program.
- All four demo profiles passed output checks: local/hosted success exit 0,
  local/hosted malformed-page failure exit 1. Failure runs retained all four raw
  detection replies, failed the first document and completed the second. Hosted
  failure produced one telemetry record; clean hosted runs produced none. Log
  and artifact destinations match the article.
- Site typecheck: zero errors and warnings, with 34 existing deprecation hints.
  Six external-link tests, complete build, card/search validation, tag validation,
  generated-link checks and diff whitespace checks pass.
- Both writing audits have zero hard findings for the changed article and shared
  guidance. The retained wording advisories concern literal file navigation and
  the real distinction between an exit-time manifest and continuous checkpoints.
  The tracked copy audit passes. The full-folder audit has 21 existing hard
  findings in unrelated untracked narration trials in the primary checkout;
  those files remain untouched. The isolated publication checkout's full-folder
  audit passes with zero hard findings across 861 files.
- Inspected the final desktop and 390-pixel phone renderings, both figures,
  captions, the runnable example, setup instructions, contents links and tables.
  Images load, code scrolls within its blocks and the page has no horizontal
  overflow. Wide diagrams retain their existing links to full-size SVGs.
- Baseline and candidate builds have identical article heading IDs and rendered
  date values. The page still displays Published October 2026 without an Updated
  label. All 123 homepage article links retain identical order; this article
  remains sixth. The generated Markdown twin contains the updated API and pin.

Article SHA-256 before:
`16007414870a13d96190f2dcb85dbafabfedd991e96a511e095e08c5f1afd1b7`.
Article SHA-256 after:
`e0d770cefabaaccd0a7f114d7b544f8b38d06d51e99761d03a621bf5823b0208`.

Publication is authorized and prepared in an isolated checkout of current remote
main at 5e7e96ae53736c35180e4faa779465c541cfb346. Only the reviewed article,
Part Four diagrams, shared diagram guidance and this task's editorial records
are included. The publication PR records checks, merge identity, deployment and
live verification. The source repository and unrelated local changes are preserved.

All six publication checks pass in that isolated checkout. The 49 site tests pass
across external-link policy, homepage order, cards, previews and feedback.
The build validates all 123 listing cards, 134 preview companions and 329 indexed
pages. The source README's existing article backlink is verified. Full logs and
the before/after live verification manifest are retained under
`D:/Source/Workspaces/matlus-breadcrumbs-publication-2026-10-17/`.
