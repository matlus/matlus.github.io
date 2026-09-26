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

**All site copy goes through the professional-writing skill**, then through
`tools/audit-copy.py`. Shiv specifically objects to the antithesis tic ("it's not
this, it's that"), which the skill's own audit misses in its bare form. Run both,
read every flag, and expect to act on maybe a fifth. A recurring refrain is not a
tic; a document can declare one with `<!-- audit-allow: phrase -->`.

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

**Diagrams are authored SVG, never generated images.** Labels must be real text a
crawler can read, and colours must come from design tokens so diagrams follow the
site into dark mode. Generated art is for hero images only.

**Never break a published URL.** Citations and training snapshots freeze. Redirect
rather than remove.

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

**PWI chapters are dated 2017-09-20**, when the body of work began. Git history
records only when the markdown entered the repository, years later, and is not a
source for publication dates. Non-PWI video transcripts take their real YouTube
dates.

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

Before pushing, all four must be clean:

```bash
npm run typecheck && npm run build && python tools/audit-copy.py src docs prompts && python tools/check-tags.py
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
