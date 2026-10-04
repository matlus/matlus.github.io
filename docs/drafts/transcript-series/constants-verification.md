# Constants and default parameter values: editorial evidence

Article: `csharp-constants-default-parameters.md`.
Public source: https://www.youtube.com/watch?v=OrpPfOu4PQ0.
Publication calendar date: March 23, 2020, from public video metadata.

## Coverage comparison

- Constant terminology and compile-time availability: opening and first example.
- Separate library and caller; replacement DLL leaves old literal: complete example.
- IL and decompiled C# distinction: literal instructions and two-argument call.
- Author's selective-DLL deployment experience: retained in first person.
- Constants must represent stable values: retained with consumer rebuild consequence.
- TaxCalculator's income and percentage example: complete library and caller code.
- Default changes from 30 to 50; old caller still passes 30: complete experiment.
- Optional defaults in library metadata: explained separately from caller arguments.
- Preference for two or three overloads and meaningful API choices: retained.
- No source diagram needs reconstruction for this article; teaching uses code and IL.

## Original code and frame checks

The local `ConstantsAndDefaults` sample contains matching identifiers, arithmetic,
and final values. Its projects target .NET Framework 4.8. The source files were
read without changing or building that original workspace.

Readable recording frames establish:

- 05:04: the caller's IL contains `ldstr "Hello World."` followed by WriteLine.
- 09:29: TaxCalculator.Calculate takes double taxableIncome and a double percentage
  defaulting to 30, and returns `(percentage / 100) * taxableIncome`.
- 10:09: caller passes 70000; console tax output is 21000. The recording's own
  on-screen correction resolves a spoken arithmetic slip in the raw transcript.

The greeting and tax experiments are combined in the article's final comparison
table. The console wait-for-Enter lines are omitted because they only hold the
historical console window open. IL excerpts omit offsets and unrelated instructions.
The Framework-specific mscorlib qualification is explained beside its listing.

Private transcripts, screenshots, sample builds and verification results are in
the local preparation workspace, outside this public repository.

## Executed verification

On October 3, 2026, .NET SDK 10.0.401 compiled the article's library listings and
combined Main method in two clean SDK projects targeting net10.0. No external
packages were needed. This verifies the teaching example on that SDK, without
claiming a reproduction of the historical Framework build environment.

| Check | Observed result |
|---|---|
| Initial library and caller build | Hello World.; Calculated Tax: 21000 |
| Change greeting and default, build library only, copy its DLL | Hello World.; Calculated Tax: 21000 |
| Rebuild caller against updated library | Hello World II.; Calculated Tax: 35000 |

All three builds completed with zero warnings and zero errors. The verification
script asserts each two-line output before recording success.

Writing audit: zero punctuation errors and zero review flags.
Repository copy audit: zero hard and zero advisory findings.

## Metadata and art

The required read-only metadata sub-agent read the full draft and vocabulary.
Its description was applied. Proposed subject tags are constants, optional-parameters,
compilation and method-design, plus the csharp language tag. The first three are
new subjects; their vocabulary entries and topic heroes await batch reconciliation.
The draft currently retains only existing tags while it remains outside the content
collection. Do not interpret that temporary metadata as the final tag selection.

Article hero generated with the built-in image tool and visually inspected:
changed orange printing block, three prior blue impressions, unused card; no text.
Full prompt is saved beside the optimized WebP. Actual asset dimensions are
2038 by 772 pixels; check the site's hero crop during rendered review.

## Remaining acceptance work

- Confirm the optional-argument IL excerpt against a readable source frame.
- Reconcile new tags and create their distinct topic art.
- Check full source coverage once more after final edits.
- Stage the article for local rendering and inspect its code, table and hero crop.
- Run collection-wide checks with the rest of the batch before publication approval.

## Publication verification, October 4

The readable 13:28 recording frame confirms ldc.r8 70000, ldc.r8 30 and the two-argument Calculate(float64, float64) call. The optional-argument IL check is closed.

Final publication metadata, artwork, rendered checks and deployment evidence are
tracked in ../../transcript-series-publication.md; earlier pending lists above
record preparation state.
