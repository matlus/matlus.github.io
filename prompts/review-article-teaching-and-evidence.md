# Review article teaching and evidence

Use in a fresh, read-only session after drafting. The publication workflow is
defined in [article-publication-workflow.md](../docs/article-publication-workflow.md).
Read the article and its evidence before consulting outside critiques. A review
may legitimately find no changes needed. Propose corrections only when supported
by a concrete reader difficulty or evidence conflict.

Review this article for teaching continuity, accuracy of its evidence, and fidelity to the author's intent. Produce findings for revision; do not rewrite the article during the review.

Inputs
- Complete article: file or URL, and revision or publication date.
- Intended reader: existing knowledge and unfamiliar concepts.
- Author's central claim, purpose, and relevant wording preferences.
- For a series: adjacent articles and the intended contribution of this part.
- Supporting evidence where applicable: repository and revision, tested prompts, inputs, recorded outputs, reference keys, and measurements.
- Rendered page or preview, if available.
- Outside critiques, if any, to assess after your own first pass.

Use the supplied reader profile. If none is supplied, infer a reasonable profile from the article and state it as an assumption. Apply supplied voice guidance, including the blog-writing skill when reviewing Shiv's articles.

Read as a careful, skeptical first-time reader trying to learn from the page.
State what the reader should be able to do or decide afterward, in your own
words. Identify the article's form: a reference organizes knowledge for lookup;
a walkthrough develops a working example; an argument supports a position.
Judge the explanation against that purpose. Do not require a reference to build
like an essay or turn an opinion piece into an API tutorial.

Establish coverage
Read the complete article, including code, tables, captions, footnotes, and collapsed material. Prefer the complete source or page over a search excerpt or limited extraction. Record the source version, every article heading read in order, and the final sentence of the article body, excluding site navigation and footer. These document coverage; they do not substitute for reading.

If the article is incomplete or appears truncated, identify what is missing and obtain the full text before issuing a complete review. If that is impossible, report the coverage limitation. For a series, read the adjacent parts completely before making conclusions about duplication, continuity, or contradictions across them. Missing adjacent material leaves those checks incomplete; it need not prevent review of the available article.

Review
1. Prerequisites and references: Are terms, policies, tools, and distinctions introduced before the explanation needs them? Can the reader locate every referenced example or result? Put necessary explanatory evidence in visible prose when a collapsed block otherwise conceals a step. Identify the knowledge the article assumes and check whether a reader can recognize that expectation before the first demanding example. Check clusters of related terms against the concrete responsibilities they name; suggest a brief distinction where their meanings blur.
2. Example continuity and consistency: Follow worked examples from inputs through decisions to results. Recalculate arithmetic and check units, counts, category policies, numbering, and chronology. For comparisons and repeated evaluations, track which inputs, instructions, reference criteria and versions changed or stayed fixed. Make sure references such as "the same", "again" and "only" identify the intended comparison without conflicting with nearby events. Identify contradictions within the article and across supplied series parts. Explain changes of assumption where they affect interpretation.
3. Claims and evidence: Compare relevant claims with the supplied code, prompts, outputs, and measurements. Distinguish recorded observations, personal experience, estimates, and proposed techniques. Treat owner-supplied first-person experience as the source for that personal account; do not create a corroboration task unless evidence conflicts with it or the prose makes a broader measurable claim. When source evidence is missing, mark the specific claim unverified and explain what would resolve it; continue checks supported by available material. Keep tested prompts and recorded outputs intact.
4. Structure and promises: Identify each section's contribution. Check that comparisons, questions, roadmaps, and promised measurements receive an answer. For a long article, check whether the reader can see the destination early and resume the explanation after a pause. Follow changes of domain and scope: does a second example explain what transfers, and is a second thesis connected to the original purpose? Before dense code, data or study sequences, check that the prose identifies what to look for and why it matters. Distinguish evidence from different populations or methods rather than treating it as one measurement. Test an important methodological distinction with a concrete case when the surrounding prose leaves the reader to invent the difference. Check that necessary diagram relationships also survive in the Markdown version. Cite passages that repeat one another or adjacent articles, and distinguish unnecessary repetition from a recap or return that advances the argument. Propose changes proportional to the reader's difficulty.
5. Voice and scope: Your proposed wording and any outside suggestions must preserve the author's position, purposeful questions, personal experience, and degree of conviction. Avoid unsupported certainty, artificial balance, generic caveats, and changes to the argument. Verify outside critiques against the actual article and evidence; agreement among reviewers does not establish correctness.
6. Presentation: Check source heading hierarchy and numbering. When a rendered page is available, inspect its contents entries, anchors, figures, captions, and collapsed blocks. Otherwise mark rendered inspection pending. It remains a required step after revision and before publication.

Report
Start with coverage, reader assumptions, and evidence limitations. Rank substantive findings by their effect on understanding or correctness, placing defects before optional preferences.

Name the clearest explanation and explain its teaching mechanism with a passage:
for example, a worked trace, concrete numbers or a comparison that resolves a
specific confusion. Name the muddiest passage if there is one, explaining the
precise inference a first-time reader must supply. These observations may also
support a ranked finding; do not duplicate it to fill a report template.

Record teaching moves worth preserving, including purposeful questions, honest
scope, fair treatment of alternatives and failures used to develop understanding.
Generic praise supplies no preservation guidance. For dense code, repeated JSON
or raw data, check whether readers can follow the conceptual thread and whether
collapsing material would hide a necessary step. Figures and tables should have
understandable labels and an explained role in the lesson. Distinguish an
article-level correction from a series-level observation; read the relevant
parts before claiming a series pattern.

For each finding, provide its status, exact passage or location, the reader's difficulty, supporting evidence, and the smallest effective correction. Distinguish confirmed defects, supported editorial concerns, unverified claims, and preferences. Do not manufacture findings to fill categories.

Finish with up to three highest-value changes and any unresolved evidence or pending presentation checks.

These checks are diagnostic questions, not a required article outline. A short
article may need no roadmap, glossary or extra example. Keep useful transfer
examples and the author's position; recommend the smallest change that resolves
an identified reader difficulty.

Keep complete review records outside published content. Do not edit the article,
source repositories, or protected historical material during this step.
