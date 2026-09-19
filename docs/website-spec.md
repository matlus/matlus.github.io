# matlus.com Website Specification

Status: draft, from design conversation 2026-09-19
Owner: Shiv Kumar

---

## 1. Purpose

A personal website at **matlus.com** covering coding, AI, and related work. PWI is a
major section but not the whole site. Other sections carry essays, in-progress
research, and pages derived from existing YouTube video content.

Two goals drive most technical decisions:

1. **Human readers** arriving from search, YouTube, or GitHub.
2. **Large language models**, both live retrieval at inference time and, secondarily,
   training ingestion. Where the two conflict, retrieval wins, because it is the path
   that pays off on a short timescale and the one that can actually be engineered for.

A specific motivation: YouTube content is not available to Anthropic or OpenAI for
training. Publishing the same material on an open domain makes it reachable by every
crawler.

---

## 2. Hosting and domain

| Item | Decision |
|---|---|
| Host | GitHub Pages |
| Repo | `matlus/matlus.github.io` (user site; name must match the account exactly) |
| Visibility | **Public**, required for Pages on the free plan |
| Domain | `matlus.com` (owned; DNS to be repointed) |
| HTTPS | Let's Encrypt, provisioned automatically by GitHub |
| Build | GitHub Actions workflow (not the built-in Jekyll path) |

DNS: apex `matlus.com` via `ALIAS`/`ANAME`, or the four GitHub `A` records if the
registrar has no ALIAS support. `www` as a `CNAME` to `matlus.github.io`. The domain
is entered in the repo's Pages settings, which writes the `CNAME` file.

**Static only.** GitHub Pages serves files and runs no server-side code. Everything
below resolves at build time or in the browser. A backend is warranted only for
comments, accounts, auth, form submission, or per-visitor personalization, none of
which are in scope. If one is needed later, use a third-party service rather than
converting the site.

---

## 3. Stack

- **Astro** for static site generation. Chosen for content collections, schema-validated
  frontmatter, trivial multi-output routes (HTML + `.md` twins), and build-time image
  handling. Runs on Node/JavaScript.
- **Pagefind** for full-text search. Builds a sharded index at build time and loads only
  the fragments a query needs.
- Deployment via GitHub Actions on push to `main`.

---

## 4. Information architecture

### Top-level navigation

```
PWI · Acceptance Testing · Writing · Research · Videos · About
```

- **PWI**, the four pillars. Evergreen reference material.
- **Acceptance Testing**, the testing chapter family, headlined by Functional
  Acceptance Testing at the Boundary. Owns its content outright rather than linking
  into PWI. See section 4a.
- **Writing**, essays on coding and AI. Time-stamped, feeds chronologically.
- **Research**, in-progress ideas and experiments. (DevWeave work lives here but the
  product name is deliberately not used in navigation.)
- **Videos**, pages derived from YouTube content, cross-linked into whichever section
  each one belongs to.
- **About**, bio, contact, links out.

Six items still fit one line comfortably. The nav label is deliberately shorter than
the concept name, so the section landing page carries the full "Functional Acceptance
Testing at the Boundary" as its H1.

### Navigation behavior

Persistent horizontal bar on desktop; collapses to a hamburger below ~768px, where it
expands as an accordion over the same tree.

Top-level items are **both a link and a dropdown trigger**. Clicking `PWI` navigates
to `/pwi/`; hovering or tapping the caret opens a panel listing the four pillars. A
top-level item that is a dead trigger is a permanent small annoyance; avoid it.

**Requirement:** dropdown contents must be real `<a>` elements present in the DOM at
page load, hidden by CSS until opened, never injected by JavaScript on hover. This
puts links to all four pillars on every page, which builds the internal link graph
crawlers follow.

The nav tree lives in **one data file** that layouts read. It is never hand-copied
into templates.

### Breadcrumbs

Every deep page carries `Home › PWI › Architecture with Intent › C# › Method Design`,
and emits `BreadcrumbList` JSON-LD. Serves readers arriving cold from search results
and tells retrieval systems where a page sits in the hierarchy.

### PWI URL hierarchy

Pillar, then language, then chapter:

```
/pwi/architecture-with-intent/csharp/method-design
/pwi/programming-with-intent/python/...
/pwi/verification-with-intent/...
/pwi/programming-to-exceptions/...
```

Pillar comes before language because the pillar is the conceptual unit, named in
videos and talks, so `/pwi/architecture-with-intent/` is a hub page worth retrieving
on its own. Language is the narrower filter.

**PWI stays one top-level item.** Promoting the four pillars to top level would
scatter the brand equity in the name and would not tell a first-time visitor that
"Architecture with Intent" is PWI.

### Language split

Python and C# get **separate generated pages** from the same chapter source:
`/pwi/<pillar>/python/<chapter>` and `/pwi/<pillar>/csharp/<chapter>`, plus a
language-neutral concept page linking to both.

Retrieval drives this, rather than authoring convenience. Real queries name a
language ("how should I structure C# method signatures"), and a page carrying both languages means
half of every retrieved chunk is noise for the asker. Both are generated from one
source, so there is no duplication cost.

Java and TypeScript guidelines stay **unpublished**, being outside current expertise.

### Chapter numbers never appear in URLs

The two language families number their chapters differently. Python ch50 is test
naming conventions, while C# cs50 is testing strategy. A numeric slug would therefore
mean different topics in the two trees.

Slugs are always topical: `/test-naming-conventions`, never `/chapter-50`. This also
keeps URLs stable if the corpus is ever renumbered.

---

## 4a. Acceptance Testing section

A top-level section owning the testing chapters outright, rather than a hub linking
back into PWI. Headlined by Functional Acceptance Testing at the Boundary.

```
/acceptance-testing/
/acceptance-testing/<language>/<topic>
```

### Chapter inventory

| Topic | Python | C# |
|---|---|---|
| Testing strategy | ch53 | cs50 |
| Test structure and organization | ch51 | cs51 |
| Test naming conventions | ch50 | cs52 |
| Test assertions | ch52 | cs53 |
| Test mediators and spies | ch54 | cs54 |
| Functional acceptance testing at the boundary | ch55 | **none** |
| Service-boundary testing | ch56 | cs55 |

### The C# gap

Python has a dedicated chapter for functional acceptance testing. C# has no
equivalent. The coverage is folded into cs55, Service-Boundary Testing in C#, whose
summary mentions domain-boundary functional acceptance tests.

This matters because the section is named after a concept the C# tree cannot show on
its own page. Until a C# chapter exists, the section landing page states plainly where
the C# coverage lives and links to cs55. Authoring a C# counterpart is listed in
section 14.

### Rule namespace

Chapter 55 emits four rules under `pwi.functional-acceptance-testing.*`. Those IDs are
tooling identifiers in the PWI repo and stay exactly as they are. The website's
information architecture is a separate concern from the rule namespace, and the two do
not need to agree.

---

## 5. Content model

### Collections

| Collection | Kind | Dated | Feeds chronologically | Reached via |
|---|---|---|---|---|
| `pwi` | evergreen reference | yes | no | navigation |
| `acceptance-testing` | evergreen reference | yes | no | navigation |
| `writing` | time-stamped | yes | yes | feed + navigation |
| `research` | time-stamped | yes | yes | feed + navigation |
| `videos` | evergreen | yes | partially | navigation + cross-links |

**Everything carries a date.** What sinks old content is the *feed* it sits in, so
the axis that matters is evergreen vs time-stamped. Evergreen content is reached
through persistent navigation and never scrolls away. Time-stamped content flows
through a feed. A PWI chapter is evergreen and dated, carrying its real YouTube
publish date.

Evergreen pages display **"Published March 2024 · Updated September 2026"** and emit
both `datePublished` and `dateModified` in JSON-LD. For reference material the update
date is what matters: a chapter with a recent `dateModified` reads as current to search
engines and retrieval systems regardless of how old the original is. An undated page is
treated as being of unknown age, which is worse than being old.

### Frontmatter schema

Validated by a Zod schema on the Astro content collection. The build **fails** on
violations.

```yaml
title:         string                 # required
description:   string                 # required, one line, used in llms.txt and meta
datePublished: date                   # required
dateModified:  date                   # optional, defaults to datePublished
tags:          string[]               # required, must be in the controlled vocabulary
image:         string                 # optional, falls back to section default
audio:         string                 # optional, presence renders the player
related:       string[]               # optional, manual override of computed related
youtube:       url                    # optional, link back to source video
language:      python | csharp | null # PWI only
pillar:        string                 # PWI only
```

---

## 6. LLM discoverability

The term of art is **GEO** (Generative Engine Optimization), sometimes AEO. Two
distinct paths matter, with very different odds:

- **Training ingestion** by `ClaudeBot`, `GPTBot`, `CCBot` (Common Crawl, which feeds a
  large share of training corpora), `Google-Extended`. You can be eligible; you cannot
  make it happen, and the lag is a year or more. Set it up, don't count on it.
- **Live retrieval at inference** by `Claude-User`, `Claude-SearchBot`, `OAI-SearchBot`,
  `ChatGPT-User`, `PerplexityBot`. Pays off in weeks. **This is the priority.**

### robots.txt

Explicit allows, because the default is ambiguous and some setups block AI crawlers by
reflex:

```
User-agent: ClaudeBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: CCBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: PerplexityBot
Allow: /

User-agent: *
Allow: /

Sitemap: https://matlus.com/sitemap.xml
```

### Markdown twin URLs

Every page is also served as raw markdown at the same path plus `.md`:

```
/pwi/architecture-with-intent/csharp/method-design
/pwi/architecture-with-intent/csharp/method-design.md
```

Linked from the HTML head with
`<link rel="alternate" type="text/markdown" href="...">`.

**The `.md` twin contains the article body only.** No nav, no sidebar, no related
list, no tag cloud, no footer. That is the entire point, it is the clean channel where
a retrieval agent gets the argument with zero boilerplate. Mirroring the full page
throws away the advantage.

Note: HTTP content negotiation (serving markdown on `Accept: text/markdown`) is
**impossible on GitHub Pages**: no control over routing or response headers. Twin URLs
are both the simpler option and the only available one.

### llms.txt

Generated at build time:

- `/llms.txt` is a markdown index of the site, listing every page with its URL and
  a one-line description.
- `/llms-full.txt` carries the full text of the site inlined.

Adoption of the standard is uneven, but it costs one build step and gives a retrieval
agent a single URL describing everything available.

### Structured data (JSON-LD)

- `Person` on the homepage with a **`sameAs`** array listing the YouTube channel,
  GitHub profile, and any other publishing account. This is the mechanism search and
  retrieval systems use to resolve those accounts as one identity rather than three
  unrelated strangers.
- `TechArticle` / `Article` per page with `datePublished` and `dateModified`.
- `BreadcrumbList` per deep page.

### Semantic HTML

Article body in `<article>`. Navigation in `<nav>`. Sidebar, tag cloud, and footer in
`<aside>`. Content extractors use this structure to separate real writing from the
furniture repeating across hundreds of pages.

### Content shape, the part that actually decides citation

Metadata gets a page found; prose shape decides whether it gets quoted. Retrieval works
on **chunks**, usually a section or two pulled out of context, so every section must
stand alone:

- State the rule and the reason in the first sentence or two.
- Define terms at first use.
- Write headings that state the claim, not just name the topic.
- Never write "as we saw above" or otherwise depend on earlier sections.
- Give every section a stable anchor so it can be cited precisely.

The existing PWI chapter style, what and why up front in plain language, then
examples, is already close to the right shape for chunked retrieval.

### URL stability

Never break a URL. Training snapshots and existing citations freeze; a dead URL is a
citation that stops resolving. Redirect rather than remove.

---

## 7. Tags

### Vocabulary control

The real maintenance risk is **tag sprawl**: `testing`, `tests`, and `unit-testing`
splitting the same content three ways six months in.

Mitigation: a single file listing every allowed tag with a one-line description,
enforced by the Zod schema so the **build fails** on an unlisted tag. The descriptions
are not wasted, each becomes a real paragraph at the top of that tag's page, turning
a bare link list into something worth retrieving and citing.

### Tag pages

Generated at build time via `getStaticPaths()`: `/tags/<tag>/` is a real, pre-built
HTML file listing every page carrying that tag. Nothing is queried at click time.

Pre-built tag pages matter for the LLM goal specifically, a purely client-side filter
would show crawlers an empty shell.

### Interactive filtering

Alongside the static pages, emit a small JSON index at build time (title, URL, tags,
one-line summary) and ship JavaScript that filters it in the browser. This gives
multi-tag selection with instant narrowing and no page reload.

Static pages for machines and permalinks; client-side filtering for humans browsing.
Both generated from the same frontmatter, so neither can drift.

### Placement

- Full tag cloud: homepage and `/tags`.
- Article pages: that page's own tags only, plus a link to the full cloud.

A hundred-tag cloud on every page is noise both visually and inside every retrieved
chunk.

### Maintenance

None by hand. Tags live in frontmatter; the build inverts tags-to-pages and emits the
cloud, the tag pages, and the JSON index. Add a page, add its tags, commit.

---

## 8. Search

**Pagefind**, integrated into the Astro build. Sharded index, lazy-loaded fragments,
designed for static sites.

---

## 9. Audio (NotebookLM podcasts)

NotebookLM-generated audio companions for newer content and some PWI chapters. An
`audio:` frontmatter field renders the player plus a download link. Audio files are
co-located with their page so content and audio move together.

### Constraints to respect from the start

- **GitHub Pages caps a published site at 1GB**, with a soft bandwidth limit around
  100GB/month. Episodes run roughly 10–20MB, so a few dozen fit comfortably and then
  they don't.
- **Git LFS will not solve this.** GitHub Pages does not resolve LFS pointers, it
  would publish the pointer file itself, producing a broken download and a confusing
  three-line text file. If audio outgrows the repo, move it *off* the repo.
- **Escape hatch:** object storage, Cloudflare R2 preferred (no egress charges), with
  the site linking out. Start in the repo, monitor the total, switch before the limit.

### RSS

Generate an RSS feed **with enclosures** at build time, making the audio subscribable
in any podcast app. Another distribution channel for the cost of one build file.

Do **not** transcribe the NotebookLM audio, it is generated *from* the page, so a
transcript would merely restate content already indexed.

---

## 10. Images

Hero image per page, full page width, larger on the homepage. Generated by an LLM.

### Consistency recipe

What makes generated art look like a set rather than a pile is keeping the recipe in
the repo:

- A **fixed prompt template** with a written style descriptor.
- **Fixed dimensions** per image role (hero, thumbnail, OG card).
- Each page's specific prompt **saved next to its image**.

Then a regenerated or replaced image still matches the set, and the whole site can be
restyled by editing one template.

### Fallbacks and OG cards

- **Per-section fallback image** is mandatory. The moment a custom image is required
  for every page, the page without art is the page that never ships.
- Hero images double as **OpenGraph cards** for link previews, generated at build time.
- Modern formats (AVIF/WebP) via Astro's build-time image optimization.

---

## 11. PWI chapter sync

PWI chapters are authored in the PWI repo. They must not be hand-copied here.

**Approach:** a GitHub Actions workflow in this repo checks out the PWI repo using a
token, copies a **curated manifest** of chapter markdown into the site's content
folder, and rebuilds. The manifest lives here, so this repo decides what gets published
and PWI needs no knowledge of the website.

Rejected alternative: a git submodule. More automatic, but it pulls the entire source
repo into the build and records the reference in public history.

### Content positioning constraints

Site copy about PWI must follow existing positioning:

- Call them **operationalized rules**.
- The count is **per language** (~340), never split as "Python rules vs C# rules".
- Every shipped rule is **certified for both language families**. Uncertified routes
  are an internal option, not part of the public pitch.
- Describe pipeline behavior as "findings reach the PR as a report". Auto-fix and merge
  behavior is customer-configured and is never stated as a default.

---

## 12. Theming and layout

### Design tokens

One file defines CSS custom properties on `:root` for colors, type scale, and
spacing. Every
other stylesheet references **only those tokens**, never a literal value. Dark mode is
a second set of token values under `prefers-color-scheme`.

Honest limit: tokens make color and typography swappable in minutes. Changing layout (where
things sit, how a chapter page is structured) is a real change to real
components, and no CSS discipline makes that a one-file edit. That is fine; re-skinning
happens far more often than re-architecting.

### Homepage

A real landing page, **not** a reverse-chronological feed and **not** a redirect into
PWI. It states who you are and what the site contains, with a short entry point into
each top-level section, over a tall full-width brand image.

The homepage is often the first URL a retrieval agent fetches. It is what tells a model
what this site *is*. A feed of recent posts answers that badly.

### Article sidebar

Right-hand sidebar carrying a mix of:

- **Related pages**, scored by tag overlap at build time, overridable by the
  `related:` frontmatter field for manual curation.
- **Latest posts**, from the same build.

All computed at build time. Wrapped in `<aside>` and excluded from the `.md` twin.

---

## 13. Interlinking

The site is the hub of a deliberate link graph:

- Every derived page links to its **source YouTube video**; every video description
  links back to its page.
- Every **public GitHub repo** README links to the relevant page; pages link back to
  the repos.
- The homepage `Person` / `sameAs` block ties the identities together.

---

## 14. Open decisions

- Visual theme and style descriptor for generated images.
- Whether `Research` is the right label for that section.
- Whether to author a C# functional acceptance testing chapter, so the
  Acceptance Testing section is symmetric across both languages.
- Exact tag vocabulary (initial list to be drafted from existing content).
- Which existing YouTube videos get transcribed first.
- Registrar DNS specifics for `matlus.com`.
