# Transcript to book chapter: editorial handoff

This guide defines the editorial step that turns a Programming with Intent video transcript into a reader-facing book chapter. It also covers ratifying a chapter that has already been drafted. The finished chapter is the source for the website conversion step. The website converter should preserve its prose and perform only the mechanical changes described in this repository's `AGENTS.md` and `docs/handoff.md`.

The author is Shiv. Write in his first person. Preserve his argument, examples, qualifications, technical meaning, and chosen language. Edit the way a careful book editor would: make spoken material readable on the page without silently becoming a coauthor.

## Status and source of truth

As of 2026-09-23, the Drive file `transcripts/00-ratified-book-chapters.md` lists ten editorially ratified chapters. Each chapter folder contains a separate canonical copy and a `RATIFIED.md` record linking the source draft, transcript, video, and follow-ups. Canonical copies are either Markdown files or native Google Docs. A folder absent from that index has not been ratified. Do not confuse the Drive index with `docs/chapter-conversion-ledger.md`, which tracks a different set of PWI corpus chapters already handled by the website converter. This public repository does not store links to private chapter drafts or transcripts; an authorized workspace must resolve them in Drive.

In this workflow, **ratified means the prose and page adaptation have received an editorial pass**. It does not claim that historical code, repository paths, technical assertions, or the recording have all been independently verified. Record those checks separately. In particular, the code in *Design Nugget: Evolution To Strategy* still needs to be matched to the video and repository.

## Inputs and editorial order

For each video, gather the existing chapter if there is one, the raw transcript in the parent `transcripts` folder, the video and its description, and linked repositories or other source material. Match the chapter by title, then confirm its source in the folder record. Preserve links to those sources in the record. Read the **entire existing chapter** before editing, including code, headings, captions, and source notes. Use the transcript to settle ambiguous spoken wording. Use the video when a claim depends on a screen, a code state, a gesture, or the order of a demonstration. Treat a repository as code evidence only after checking the relevant file or revision.

If a chapter already exists, edit a copy in the same chapter folder and preserve the original. If there is only a transcript, write a new chapter with the video title as the starting title, retaining the author's argument and sequence. When copying a native Google Doc, preserve its format, tabs, headings, links, and other useful structure. A Markdown source should remain Markdown unless the author directs a format change. Give the canonical copy a distinct name, such as `- ratified`.

## Nonnegotiable editorial boundaries

1. **Keep the content and meaning.** Do not change a conclusion, tighten a claim into a stronger one, remove a qualification, invent a supporting example, import a later opinion, or reconcile a contradiction by guessing. If something seems technically wrong or outdated, flag it for review. A legitimate later addition can stay if the existing chapter includes it, but identify it as later material rather than pretending the video said it.
2. **Keep Shiv's voice.** First person is welcome. Preserve direct address, pointed questions, plain technical language, skepticism, concrete analogies, and deliberate emphasis when they carry the argument. Keep the cadence human. Avoid turning a firm opinion into neutral textbook prose or adding marketing language.
3. **Keep deliberate phrases exactly.** `Simplicate, don't Complify` and its intentional variants `simplicate` and `complify` are wordplay, not spelling mistakes. Likewise, retain meaningful refrains such as locking the front and back doors and technical distinctions such as baseline versus later design. Do not normalize identifiers, filenames, folder spellings, quotation marks inside code, or repository URLs based on what seems more conventional.
4. **Edit the prose, not the demonstration.** Preserve code blocks, syntax, identifiers, call order, and the relationship between code and explanation until their provenance is checked. If code is illustrative rather than taken from the video or repository, say so. Do not present plausible replacement code as the historical code.
5. **Keep uncertainty visible.** A chapter may be prose-ratified while a code or source question remains open. Use a short reader-facing note when uncertainty would otherwise mislead a reader, and put detailed follow-up in `RATIFIED.md`.

## Turning speech and screen references into page prose

Remove transcription artifacts such as repeated words, false starts, filler, greetings that serve only the recording, redundant signposts, and summaries that repeat the same point. Repair punctuation and sentence boundaries. Split a long spoken sentence or join choppy fragments when doing so makes the existing thought clearer. Remove repeated explanations only after checking that each repetition adds no distinct claim, exception, or emphasis.

Recast video-only directions according to what the reader actually has on the page:

| Spoken or video-bound form | Page treatment |
| --- | --- |
| “You can see here,” “look at the screen,” “this one over here” | Name the class, method, code block, figure, or behavior. If the referent cannot be identified, inspect the video or mark the passage for review. |
| “As I scroll down,” “I'll click,” “I'll switch windows” | State the next idea or describe the resulting view only if it matters to the argument. |
| “This diagram” with no diagram in the chapter | Add or retain a faithful diagram with a caption and usable file path, or describe the relationships in prose from verified evidence. |
| “Pause the video and try it” | Invite the reader to stop before the next section or code example and try the exercise. |
| “Earlier in this video” or “I'll show you in a minute” | Use the chapter's section or example as the reference, or remove the time cue if it adds nothing. |

Never write as if the reader sees an absent screen. Do not infer unseen code from a transcript. A figure or code excerpt must correspond to what the surrounding text says. Preserve relative image paths only when the asset will be carried into the destination. If the visual is needed but unavailable, log the missing asset and leave the relevant passage for review.

The first ratified Design Nugget chapter gives a concrete example. The draft's “You don't need the models and enum on screen anymore. Let's look at the baseline” became a transition into the baseline section. Its invitation to pause the video became “Before reading on, try building your own baseline.” The argument and exercise remained the same.

## Structure and style

- Open with the chapter's subject and the author's actual claim. Remove drafting metadata such as `Tier: Book chapter`, `design payload`, `corpus`, internal chapter mapping, or `source/transcripts/...` paths from reader-facing prose. Put useful source information into readable text or the status record.
- Use headings to follow the argument, demonstration, and conclusion. Preserve substantive section order unless a move is needed for comprehension and does not alter the reasoning. Break up a wall of transcript text, but do not impose a uniform template on every chapter.
- Keep code fences, language labels, lists, quotes, and figures readable. Ensure prose introduces a code example and explains the point it demonstrates. Do not silently truncate a worked progression.
- Use direct sentences and concrete nouns. Resolve ambiguous “it,” “this,” or “that” when the referent is clear from the source. Preserve necessary technical terms and definitions.
- Retain intentional rhetorical questions and emphatic sentences. Remove casual repetition when the point has already landed. Use bold only for emphasis that helps the reader follow the argument.
- Keep the title close to the video's title. A descriptive subtitle is acceptable if it reflects the material. Do not rename a provocative title to soften the author's stance.

The ratified *Configuration Provider Design Pattern* chapter shows a useful boundary: it retains the author's first-person argument and states clearly that its later composition and testing sections reflect current practice beyond the video. The ratified *Dependency Injection? No Thank You!* chapter replaces internal drafting metadata with a reader-facing introduction and labels its code as illustrative because the video does not walk through a repository.

## Video descriptions, links, and code provenance

Inspect the current YouTube description for each video. Carry its relevant source links into the chapter as working hyperlinks, especially GitHub repositories used for the example. Place the video link near the opening or in a concise source note. Put a repository link near the discussion or code it supports. A link buried only in `RATIFIED.md` does not serve the reader. Preserve the repository's actual spelling, even if the URL looks odd. Check whether the description links to a whole repository, a subfolder, a file, or a particular revision, and link as specifically as the evidence supports.

Check that the chapter's code attribution matches the sources. A video may show an older revision while the repository's default branch has changed. A chapter may use newly written illustrative code or a later implementation. Distinguish those cases in the chapter. Verify a repository URL resolves and inspect the relevant files before claiming that the displayed code came from that repository or video. When a description link is missing, private, broken, or unrelated, record the finding. Never invent a substitute. Other relevant links in the description should likewise be carried over when they support the chapter, with their purpose made clear.

For code that has not yet been matched to the recording or repository, preserve the excerpt and mark provenance as pending. That is the current state of the first Design Nugget chapter. Do not change the example merely to make it compile or match today's branch without Shiv's confirmation. Where the video has no code walkthrough, the chapter may still contain useful illustrative code, labeled as such.

## Ratification record and publication handoff

The canonical chapter belongs beside its original in the chapter folder. Add `RATIFIED.md` there with the canonical link, source draft, raw transcript, video, editorial scope, date, and each outstanding code, visual, link, or technical check. Update the Drive index `transcripts/00-ratified-book-chapters.md`. Keep the chapter and transcript Drive links in those Drive records rather than this public repository. Ratification is per chapter, not a blank `ratified` file that obscures which copy is canonical.

Before marking the editorial pass complete, compare the result to the source for missing claims, changed conclusions, code changes, link losses, broken headings, and screen references that still assume video. Open every relevant source link. If evidence is missing, keep the question explicit in the record. Review the rendered document or page for readable code and figure placement. Review meaning and presentation in full rather than relying on keyword matches.

For the website, consume the **canonical ratified copy**, not the raw transcript or the unedited chapter. Keep the website conversion's mechanical contract: remove the chapter H1 where the page template supplies it, and fix corpus links that do not resolve outside the source repository. Do not run a fresh prose rewrite in the converter. The website's description, tags, frontmatter, true YouTube publication date, link validation, and build checks are a separate publishing step governed by `AGENTS.md`, `docs/handoff.md`, and `prompts/extract-description-and-tags.md`. Preserve the video's link on the page and the chapter's relevant repository links. Do not equate a row in the ratification index with verified code provenance or automatic publishing approval.

## Compact operating checklist

1. Identify the video, existing chapter, transcript, description, repository links, and any visual assets. Read the chapter and use the transcript and video to resolve ambiguous references.
2. Produce a distinct canonical chapter in the chapter folder. Keep first person, meaning, deliberate vocabulary, code, and useful structure. Remove spoken clutter and replace screen cues with grounded page references.
3. Carry relevant video-description links into the chapter. Verify what each code sample and image actually represents. Label illustrative or later material. Record unresolved provenance.
4. Compare the full chapter with its sources, inspect the rendered result, and check links. Add `RATIFIED.md` and update the central index with honest follow-up status.
5. Hand the canonical chapter to the website pipeline. Apply site metadata and mechanical conversion there, then run that repository's audit, tag, typecheck, and build gates before publishing.

The first ten canonical examples are linked from the Drive ratification index. Their markers show the actual editorial scope and exceptions for each chapter. The rules above define the next pass.
