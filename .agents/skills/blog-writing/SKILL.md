---
name: blog-writing
description: Draft or edit blog articles in Shiv Kumar's voice, with deliberate teaching flow, concrete examples, candid opinions, and purposeful questions. Use for his blog posts, technical teaching articles, and requests to write in his blog voice. General professional correspondence and verbatim archival recovery have separate purposes.
---

# Blog Writing

Write as Shiv explaining something he understands to a reader he wants to help understand it. Preserve his reasoning, position, and way of developing an explanation. This skill combines the clarity principles of professional-writing with guidance grounded in his original blog articles and spoken teaching. It is self-contained and does not require invoking or changing that skill.

Apply the voice across blog subjects and formats: practical notes, tutorials, explanations, reflections, and opinion pieces. The recovered article corpus is the foundation; transcript observations add evidence about emphasis and teaching sequence. Extract reusable writing choices from these sources. Their particular technical positions, examples, and article structures stay attached to their subjects. Forcefulness is one part of the voice; match the conviction, patience, curiosity, and pace to the author's supplied position and the article's purpose.

Read [clarity-and-editing.md](references/clarity-and-editing.md) and the relevant examples in [voice-and-flow.md](references/voice-and-flow.md) before a substantial draft. For a small edit, preserve the surrounding article's established voice. When the Matlus repository is available, its 53 originals under `docs/source-material/matlus-wayback/` provide fuller samples; use `manifest.json` to locate one or two articles with a similar teaching purpose. The bundled examples remain usable elsewhere.

## Establish the reader's path

Identify what the reader is trying to do or understand, what they already know, and the specific difficulty or misconception this article addresses. Infer these from the request and source when possible. Ask only when a missing answer would change the article materially.

Build the explanation in an order that makes each next step intelligible. A useful path is a recognizable situation, enough context to reason about it, a concrete example, the explanation of what happens, and the consequences or limits. Adapt that path to the subject. A short snippet may need only a situation, code, and a parameter explanation; a design argument needs the competing assumptions and their consequences. Do not force every article into the same outline.

Introduce a term, distinction, or prerequisite when the reader first needs it. Show a working baseline before complicating it when that helps. Use the same example as the explanation develops so the reader can see what changed and why. Make transitions follow that reasoning.

Around code, tell the reader what to look for, show the code, then explain the significant choices and observable result. Refer to actual methods, parameters, data, and output. Listing numbers and captions are useful when the article needs them; code should never have to carry the explanation alone.

## Preserve Shiv's voice

- Speak directly and conversationally, with language precise enough for the subject. Use ordinary connecting phrases when they move the explanation forward. Let sentences vary naturally in length.
- Preserve his opinions, degree of conviction, and manner of expressing disagreement. Keep a firm judgment firm, including skepticism or frustration when it belongs to the source. Explain its reason and consequence. Do not neutralize a position, add artificial balance, or intensify it into a new attack.
- Use purposeful questions where they express a real reader difficulty, introduce a choice, or lead into an example that answers them. Preserve meaningful questions in source material. There is no question quota and no requirement to open with one.
- Choose pronouns by meaning. First person identifies Shiv's supplied experience or opinion; direct address speaks to the reader; shared language can accompany a demonstration. Do not cycle among pronouns or manufacture an experience to sound like him.
- Preserve useful asides, analogies, deliberate emphasis, and a return to an earlier point when they help the reader connect the explanation. Avoid imitating catchphrases, punctuation quirks, typos, or bluntness as a performance of personality.
- Give short practical posts room to be short. Let a sustained explanation take the space it needs. End when the reader has the promised understanding or result; use a conclusion only when it adds a decision, consequence, or useful next step.

## Give a strong rule room to teach

When Shiv states a rule forcefully, preserve that force and its intended scope. Do not automatically turn "never" into "usually avoid" or surround the rule with a catalogue of exceptions. State the principle clearly, explain why it matters, and let the example develop the reader's understanding. A justified exception does not make the principle a casual preference.

Introduce a qualification when the reader needs it to understand the current case or make the next decision. Explain the reason for an exception when the discussion reaches it. Keep essential scope in the rule itself. Preserve supplied qualifications, but avoid adding defensive caveats merely to anticipate every possible objection. If a claim conflicts with the evidence, flag that conflict; forceful delivery does not authorize inventing certainty or broadening the author's claim.

Preserve distinctions between ideas, terms, or actions that serve different purposes. Before treating an objection as an exception, establish whether it concerns the same claim or introduces a different question. Explain that difference at the point where it helps the reader.

Read [spoken-teaching.md](references/spoken-teaching.md) when shaping a sustained argument or adapting a transcript. Preserve questions that anticipate a real objection, deliberate emphasis, and returns to the rule that deepen its meaning. Remove transcription noise and accidental repetition while keeping the teaching purpose.

## Write a standalone article

Every website article must teach its subject on the page, whatever supplied its
source material. Apply this skill to all article drafts and edits. When adapting
a transcript, write the explanation directly in the author's voice. Do not narrate
the video, recording, presenter, transcript or slides, or tell readers to watch,
pause or recall them. Optional YouTube and repository resource links can remain.

Replace references to a screen, cursor, live output or unseen demonstration with
the actual code, data, results, diagram and explanation needed at that point.
References such as "the loop above" are useful only when that loop is present in
the article. Preserve the lesson rather than deleting the demonstration's substance.
If evidence is unavailable, keep that editorial task outside the article and
qualify the supported example without inventing missing details.

Explain technical corrections and benchmark limits directly: "Concat leaves the
collections unchanged" teaches the behavior; a report of what the speaker got
wrong does not. Keep source-comparison notes in editorial records. During review,
read the body, captions, alt text and conclusion as someone with no knowledge of
the source video, and check that every necessary step is available on the page.

## Edit with fidelity

For an existing article, preserve its argument, examples, qualifications, and conclusions. Fix grammar, spelling, and awkward syntax where doing so leaves the meaning and tone intact. Preserve deliberate wording and opinions. Source archives remain unchanged; make edits in a separate publication copy.

Keep code, identifiers, output, benchmarks, and technical claims faithful to the supplied evidence. A prose edit does not authorize code modernization. Record a suspected technical defect separately rather than silently changing the demonstration. For new writing, use the actual supplied experience and position; do not infer today's opinions from a historical article on a different subject.

Use historical samples to learn voice and teaching flow. Their dated APIs, product claims, benchmarks, and recommendations do not establish current technical facts. Distinguish a faithful historical republication from a newly researched article. Follow the task's source and verification requirements.

## Review the actual draft

Read it as a learner: is each idea introduced before it is needed, does the example answer the opening problem, and does the explanation connect the code to its result? Then read for voice: has an opinion been softened, a rule buried under caveats, a question made decorative, an experience invented, or a conversational explanation turned into textbook prose?

Check that the draft fits its own subject and purpose. It should carry the author's way of explaining without importing a sample article's technical position, making every post argumentative, or repeating one source's structure.

Apply the clarity pass in the supporting reference. Where the professional-writing audit is installed, its `scripts/audit.py` can flag punctuation and wording in substantial drafts without invoking that skill. Review flags in context; a purposeful question, necessary technical contrast, or required quotation should retain its meaning. Apply repository copy checks and publication requirements where relevant. Do not rewrite archival samples to make a style audit pass.

When preparing an article for this site's publication, follow `docs/image-and-diagram-guide.md` and `prompts/generate-article-card.md`: supply a 1600 x 534 hero and a separate 1200 x 500 card, save their prompts, and review the card's foreground subjects at actual display size. This includes historical articles newly prepared for the site. Preserve existing approved heroes when adding cards.

Return the requested draft or edit. Publication still requires the owner's authorization.
