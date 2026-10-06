# matlus.com

These are the instructions for every coding assistant working in this repository.
`CLAUDE.md` imports this file, so Claude Code and other agents read the same text.
Edit this file only.

Personal website for Shiv Kumar. Astro, deployed to GitHub Pages at
https://matlus.com.

Read [docs/handoff.md](docs/handoff.md) first. It carries current state, open
decisions, and the reasoning behind choices that look arbitrary without it.

---

## Standing rules

**Every website article and article edit must use the
[blog-writing skill](.agents/skills/blog-writing/SKILL.md), regardless of source.**
This includes original writing and articles derived from transcripts, notes or code.
The skill preserves Shiv's voice and teaching flow. It includes the shared clarity
principles and adds guidance from the 53 recovered originals in
`docs/source-material/matlus-wayback/`. Keep those originals unchanged; edit
publication copies. Preserve opinions and purposeful questions in context.
Other site copy uses the professional-writing skill, which remains unchanged.
Run the applicable writing audit and `tools/audit-copy.py` on authored copy.
Shiv specifically objects to the antithesis tic ("it's not
this, it's that"), which the professional-writing audit misses in its bare form. Run both,
read every flag, and expect to act on maybe a fifth. A recurring refrain is not a
tic; a document can declare one with `<!-- audit-allow: phrase -->`.

**Articles stand on their own.** Teach the subject directly, without narrating
the source video, transcript or presentation. Replace screen, cursor and live-demo
references with the code, data, results, diagrams and explanation the reader needs
on the page. Keep YouTube and repository links as optional resources; they must
never supply a missing step in the lesson. Preserve substantive qualifications
in terms of the example's behavior or evidence, and keep source-comparison notes
in editorial records. Follow the [standalone article workflow](prompts/transcript-to-standalone-teaching-article.md)
and [writing guide](docs/writing-guide.md#standalone-articles).

**Every new article needs a hero and a separately composed listing-card image.**
New article heroes export at **1600 x 534 pixels, approximately 3:1**. Card images
export at **1200 x 500 pixels, exact 12:5 (2.4:1)**. Use
[the card prompt](prompts/generate-article-card.md) to recompose the hero's interesting
subjects for the smaller display: preserve complete foreground faces and working
hands, and simplify peripheral scenery. Inspect both at their actual display sizes.
Follow [the image guide](docs/image-and-diagram-guide.md#fixed-dimensions), save both
complete prompts beside the optimized assets, and measure the returned dimensions.
Prompt wording does not guarantee the generator's output size. Keep existing heroes
unless replacing them is part of the request; article headers show their natural
ratio. Older articles without companions show the complete hero in the card frame.
The build checks companion dimensions and provenance, and requires companions for
articles published from September 2026 onward. Historical articles newly prepared
for publication also require both images as part of editorial review.

**Every post gets its description and tags from
[prompts/extract-description-and-tags.md](prompts/extract-description-and-tags.md)**,
run by a sub-agent before publishing. New tags go into `src/data/tags.ts` without
asking Shiv, after `tools/check-tags.py` confirms they duplicate nothing. Tag patterns
by family: `design-patterns` for substantial coverage of named software design patterns,
`architectural-patterns` for system structures and boundaries, and
`ai-workflow-patterns` for coordination of model judgments with code. Keep specific
pattern tags when explained or applied; a passing mention earns no tag.
Each new tag creates a published topic page. Give it a distinct hero based on the
tag's subject: save `src/assets/heroes/tag-<slug>.prompt.md` and the optimized
`tag-<slug>.webp` before publishing. Follow the tag workflow in
[docs/image-and-diagram-guide.md](docs/image-and-diagram-guide.md). The full
`tools/check-tags.py` check requires both files.

**PWI chapter prose is never rewritten.** Chapters are corpus material and answer to
terminological exactness and consistency with their siblings, not to this site's
writing style. `tools/audit-copy.py` skips `src/content/chapters` for that reason.
Conversion makes exactly two mechanical edits: drop the chapter H1, and fix corpus
links that do not resolve off-repo.

**The product name "DevWeave" appears nowhere on this site.** Not in copy, not in
diagram captions, not in repo docs, because the repository is public.

**Diagram images default to the approved pastel architectural infographic style.** Use
[prompts/generate-pastel-boxology.md](prompts/generate-pastel-boxology.md) to derive
the drawing brief from the article, a written description, or a source diagram.
For articles using sculpted 3D illustrations, choose
[the sculpted infographic prompt](prompts/generate-sculpted-3d-infographic.md)
for dimensional icons and shallow diagrammatic layouts, or
[the technical diorama prompt](prompts/generate-3d-technical-diorama.md)
for miniature environments with deeper perspective. Include people only when
requested and use each prompt's physical-scale guidance.
The assistant writes the complete brief; the owner need not fill in the prompt.
Richly illustrated diagrams can be
generated PNG or JPEG. Simple boxology can be authored SVG, with real text labels
and design-token colours. Give raster diagrams descriptive alt text and a caption
or nearby prose that explains their important relationships. Hero art retains its
separate technical editorial ink style.

**Never break a published URL.** Citations and training snapshots freeze. Redirect
rather than remove.

**Off-site HTTP(S) links always open in a new tab.** Published HTML must use
`target="_blank"` and `rel="noopener noreferrer"` for external destinations,
including article prose, videos, sample repositories, cards and footer links.
The shared middleware applies this policy during rendering. Preserve normal
navigation for internal links. During publication, run
`python tools/check-links.py dist`; CI rejects missing targets and external-link
policy violations. See [the writing guide](docs/writing-guide.md#links-and-publication-checks).

**Keep editorial review tasks out of published content.** Track unfinished
article verification in [docs/article-review-backlog.md](docs/article-review-backlog.md).
Keep substantive source qualifications in the article when readers need them to
interpret an example.

**Publishing includes cross-links.** Before publishing a video-derived article,
verify its canonical `https://matlus.com/writing/<slug>/` URL, then add it to the
source video's description alongside any existing repository link. For a PWI video,
also link to `https://matlus.com/pwi/`. When a public repository supplies the
article's code, link its README to the article and keep the article's repository
link. Check the live URLs and record any unavailable or uncertain match instead of
inventing one. The source video and repository must already be public before adding
their links.

**Historical PWI material keeps its original date.** Corpus chapters and programming
guideline articles without a direct source video use 2017-09-20, when the body of
work began, unless a better documented historical date applies. Directly
video-derived articles use the matching video's public YouTube calendar date,
including PWI videos. Keep that displayed date without shifting it to another day
through UTC conversion. Recent conversion and editorial work belongs in
`dateModified`. Git history records repository revisions and supplies no evidence
for the original publication date.

---

## Verification, learned the hard way

Three build failures reached `main` because checks ran but their output was hidden or
incomplete. Do not repeat these.

- **Never pipe a check through `tail -n` or `/dev/null`.** `npm run typecheck | tail -3`
  prints the warnings and hints lines while cutting off the error count above them.
  Grep for the error line explicitly.
- **Typecheck passing does not mean the build passes.** Astro extracts
  `getStaticPaths` into its own module, where constants declared in component
  frontmatter are out of scope. That is a runtime failure a typecheck cannot see, and
  it has happened twice. Run `npm run build` as well, every time.
- **Verify deploys against the right commit.** `gh run list --limit 1` may still show
  the previous run. Match its `headSha` to `git log -1`.

Before pushing, all six checks must be clean:

```bash
npm run typecheck && npm run test:links && npm run build && python tools/audit-copy.py src docs prompts && python tools/check-tags.py && python tools/check-links.py dist
```

---

## Commands

```bash
npm run dev          # dev server on 4321
npm run build        # static build into dist/
npm run typecheck    # astro check

python tools/audit-copy.py src docs prompts  # copy audit, gates CI
python tools/check-tags.py                 # tag near-duplicates, gates CI
python tools/convert-chapters.py           # convert chapters marked ready
node tools/prepare-image.mjs <png> <slug>  # hero original to committable webp
tools/codex-desktop.sh exec "<prompt>"     # image generation via the desktop binary
```

Every push to `main` deploys. CI runs the copy audit, the tag check, typecheck, then build.

The dev server backgrounds with `astro dev --background`, managed via
`astro dev stop`, `astro dev status`, and `astro dev logs`. A server left running
from an earlier session serves stale routes, so restart it rather than trusting
a 404.

Astro documentation: https://docs.astro.build. Consult these guides before related
work:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles](https://docs.astro.build/en/guides/styling/)
