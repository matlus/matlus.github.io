# Extract Description and Tags

Use this prompt before publishing any post on this site: an article, a PWI chapter,
or a transcript-derived page. Give it to a sub-agent together with the post. It
returns the post's one-line description and its tags, including any tags that do not
exist yet.

**Inputs the caller supplies**

- The path to the post.
- The path to its sibling, if one exists. A PWI chapter covered in both languages has
  a sibling page in the other language.
- The tag vocabulary, `src/data/tags.ts`.

**What the caller does with the result.** The sub-agent only reads and reports. The
caller adds any new tags to `src/data/tags.ts`, writes the description and tags into
the post's frontmatter (or its entry in `tools/chapter-manifest.json`), then runs
`python tools/check-tags.py` and the usual build checks. Process posts one at a time,
or reconcile new tags across a batch before adding them, so two runs cannot each
invent the same tag.

---

## The prompt

You are writing the description and choosing the tags for one post on a technical
website. Both are read by search engines and language models before anything else on
the page, so both must be true of the whole post and specific to it.

Read the entire post before writing either. A description or tag drawn from the
opening sections describes only the opening.

### Part 1: the description

**Find what the post is about.** Answer these three questions from the post's own
text before writing anything.

1. **What does it claim or teach?** The central idea a reader leaves with. Posts often
   state it outright, in an Intent section or a bolded line.
2. **What carries that claim?** The two or three mechanisms, rules, or examples the
   post spends most of its length on. Judge this by how much text each one gets.
   A short section counts for less than a long one, even though each has a heading.
3. **What sets it apart from its sibling?** If a sibling was supplied, name what this
   post has that the sibling does not. For language siblings this is usually how the
   language shapes the idea: C# enforces visibility with the compiler, Python
   declares it through package exports.

**Write it.**

- Lead with the claim from question 1, then name what carries it. Fold in question 3
  when there is a sibling.
- One or two sentences, 140 to 200 characters. Search results cut off near 160, so
  the first 160 must stand on their own.
- Use the post's own terms, such as Domain Facade or Service Locator, not
  paraphrases. Retrieval matches on vocabulary.
- Do not list section headings. A list of topics tells the reader what the post
  contains but not what it says.
- Do not open with "This chapter", "This article", "Learn how" or "A guide to", and do
  not repeat the title.
- No hype, and no adjectives that grade the content, such as "comprehensive".

**Follow the professional-writing skill.** Every description is site copy, so it
must meet that skill, and the caller also runs it through `tools/audit-copy.py`. If
the skill is not available to you, the caller applies it to your draft.

**Check it.** A reader who sees only the description should be able to predict what
most of the post covers. If a sibling was supplied, the description should be wrong
for the sibling.

### Part 2: the tags

A tag names a subject a reader might come looking for. The vocabulary is
`src/data/tags.ts`. Read each tag's description as well as its slug.

There are three kinds of tag, each with its own rule.

**Subject tags: two to five.** A subject the post is substantially about, meaning it
gives the subject a section or more. A passing reference earns nothing.

- Specific enough to separate posts. `levels-of-abstraction` is a subject. `best-practices`,
  `clean-code`, `software-engineering`, `design` and `tips` are not: they would fit
  every post and so separate none.
- Single-use is fine. A tag that only this post will ever carry still earns its place
  if it names a real, specific subject of the post.

**Design pattern tags: every pattern the post relies on.** A named design pattern
gets a tag whenever the post explains it or uses it as part of the design it
describes, even when the pattern is not the post's main subject. Only a bare
cross-reference, such as "see the Gateway chapter", does not count. Any post with at
least one pattern tag also carries `design-patterns`. These tags do not count toward
the subject budget, because they feed the site's Design Patterns section, where
completeness matters.

- Patterns include the classic ones (Adapter, Strategy, Factory, Factory Method,
  Decorator) and the named patterns of this body of work (Domain Facade, Service
  Locator, Configuration Provider, Gateway, Data Manager).
- Slug: the pattern's name as the post writes it. Add `-pattern` only when the bare
  name is a generic word: `domain-facade`, `service-locator`,
  `configuration-provider`, but `gateway-pattern`, `adapter-pattern`,
  `strategy-pattern`.

**Language tags.** `python`, `csharp` or `typescript` for each language the post has
code in. These do not count toward the subject budget either.

**Procedure for every candidate tag.**

1. List the candidate subjects and patterns in plain words.
2. Use an existing tag when one covers the candidate. A tag covers it when a reader
   following that tag would expect to find this post.
3. For a candidate no existing tag covers, run
   `python tools/check-tags.py <candidate-slug>`. It flags spelling-level duplicates
   outright and lists the nearest existing tags. Then judge by meaning against the
   nearest tag:
   - Same subject, different words (`exceptions` against `error-handling`): use the
     existing tag.
   - A narrower subject the post is centrally about (`levels-of-abstraction` under
     `architecture`): a new tag. Keep the broader tag too if the post also covers the
     broader subject.
   - A narrower subject only mentioned: no tag.
4. Slugs are lowercase and hyphenated, in the form a reader would search for: the
   noun phrase for a thing (`public-surface`), the gerund for a practice
   (`testing`). Never an abbreviation the post itself does not use.

### Output

Return exactly this, and nothing else.

```text
DESCRIPTION
<the description>

REASONING
Claim: <answer to question 1>
Carried by: <answer to question 2>
Distinct from sibling: <answer to question 3, or "no sibling">

TAGS
<slug>  <existing | new>  <subject | pattern | language>

NEW TAGS
<slug>
  label: <display label>
  description: <one or two sentences defining the subject itself, not this post; this
               becomes the opening paragraph of the tag's page>
  nearest existing: <slug from check-tags.py>, not used because <reason>
```

Write `NEW TAGS: none` when every tag already exists.
