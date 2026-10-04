# Recovered articles publication plan

## Goal and source of truth

Republish all 53 recovered Matlus articles with their original titles, calendar
dates, prose, code, and teaching sequence. The immutable source is
`docs/source-material/matlus-wayback/manifest.json` and its captured article HTML,
text, metadata, and images. Each published post receives a new editorial ink hero,
appropriate new inline artwork, a source-grounded description, and reconciled tags.
No YouTube or repository metadata is added.

## Execution stages

1. Inventory all articles, dates, code blocks, images, and links. Assign canonical
   writing URLs and record the mapping from historical URLs. Preserve source hashes.
2. Have subagents apply `prompts/extract-description-and-tags.md` to every complete
   article. Reconcile their proposed tags by meaning across all 53 posts and the
   existing vocabulary. Retain useful specific subjects; create a distinct hero and
   full prompt for every new topic page.
3. Convert the captured article bodies mechanically into publication copies. Preserve
   wording and code, remove only obsolete presentation scaffolding, and repair links
   to recovered articles using the canonical URL map. Preserve external references
   and record unavailable downloads or embeds without inventing replacements.
4. Read each article and inspect its old inline images. Write individual hero briefs
   with a concrete scene, meaningful supporting details, and a central relationship
   that survives the wide crop. Vary scenes across the collection while keeping the
   established ink style. Generate, inspect, and optimize each selected image.
5. Recreate each substantive inline image with a consistent visual style within its
   post. Preserve the original relationships, labels, and recorded values. Historical
   UI and benchmark images become clearly identified explanatory reconstructions;
   do not fabricate fresh measurements or present invented UI as a captured screen.
   For the four unavailable images, derive an explanatory illustration only from
   the surviving prose and label its purpose. Add further illustrations where they
   materially clarify a concept. Save prompts and descriptive alternative text.
6. Validate every publication copy against the source: normalized prose sequence,
   exact code text, original date, image coverage, and link destinations. Validate
   rendered HTML and Markdown twins as well as source files. Inspect representative
   long code, lists, tables, image-heavy posts, and short notes in the browser.
7. Run copy and tag checks, typecheck, build, generated-link checks, and archive
   checksum verification. Review the complete change, commit, push, create and merge
   a PR, then verify the exact merge commit's Pages deployment and all 53 live URLs.

## Fidelity and editorial boundaries

Original prose and code are preserved, including historical technical opinions and
terminology. Copy audits apply to newly authored descriptions, captions, prompts,
and documentation; they must not force rewrites of faithfully reproduced text.
No code modernization, added video association, or inferred repository association
is part of this publication. By Shiv's explicit decision, each recovered article's
`dateModified` equals its original `datePublished`. Recovery does not make a
historical article newly updated. The existing feed sorting behavior stays intact;
Git history records recovery and publication work.

Recovered internal article links point to their new counterparts. Historical root
article URLs receive redirects where available without colliding with current routes.
Tag links use the site's controlled vocabulary; cross-links and tags have separate
purposes. New art does not replace substantive evidence with guessed details.

## Completion evidence

The execution register will track each article's source, date, canonical slug,
description/tag review, hero, inline image replacements, conversion verification,
rendered verification, and final live URL. Completion requires all 53 entries to
pass, all required assets to exist, a clean build, and successful live verification.

## Progress

- Source archive committed in PR #56; 215 checksums verified after merge.
- Publication branch: `codex/publish-recovered-matlus-articles`.
- Inventory and conversion complete: 53 articles, 198 original code blocks and
  215 unchanged archive checksums. Original license notices also survive.
- Four metadata subagents reviewed every complete article. Reconciliation produced
  71 new topics within a 146-topic vocabulary. JSON and JSONP remain distinct;
  ASP.NET Web API uses one canonical spelling.
- All 53 article heroes and 71 topic heroes generated, visually reviewed and
  optimized. All 59 inline positions have individual briefs and new artwork.
- Code visible only in one source editor image is separately transcribed and
  checked. Its newlines use HTML entities to prevent Markdown reparsing.
- Source checks compare prose without whitespace changes and all fenced code
  exactly. Rendered HTML additionally allows the site's existing smart quotes and
  ellipsis typography; Markdown twins retain the publication source text.
- Historical fragment repairs preserve visible wording. Missing feature sections
  in the browser-video comparison point to the corresponding comparison-list items.
- Typecheck passed with 0 errors, 0 warnings and 34 existing deprecation hints.
  Final build generated 269 pages; search verification passed with 268 indexed pages.
- Copy audit: 0 hard flags and 31 reviewed advisory flags. The one new article
  advisory quotes original OAuth prose and was retained for source fidelity.
  Tag validation passed for all 146 topics, including hero prompts and assets.
- Final rendered comparison passed for 53 HTML/Markdown pairs, 71 new topic pages,
  342 image resources and 53 historical redirects. Source verification passed for
  all 198 original code blocks and 215 archive checksums.
- Browser inspection covered desktop hero layout and code, the MVC article's
  reconstructed diagram layout, and mobile article typography, code and tables.
  At a 390-pixel viewport, long code and tables scroll inside the content column.
- Publication PR records the exact merge commit, Pages run and live verification.

## Rechecking the publication

Run the four repository gates, then `python tools/check-recovered-articles.py --ready`
and `python tools/check-recovered-rendered.py`. After deployment, run the rendered
check with `--live`; it fetches every article and Markdown twin, article image
resource and historical redirect. Match the Pages run to the merge commit first.

The recovery utilities require Python packages `beautifulsoup4`, `markdown-it-py`,
`markdownify` and `PyYAML`; asset preparation uses the site's existing Sharp package.
`prepare-recovered-articles.py` is a one-time conversion tool and refuses to overwrite
reviewed publication copies. Edit those copies directly. Keep the archive unchanged.
