# Search Console follow-up, October 25, 2026

The owner requested a follow-up to [issue #3](https://github.com/matlus/matlus.github.io/issues/3)
after allowing Google time to process the site's recovery. This audit used the
owner's signed-in Chrome session and public HTTP checks. Search Console still
confirms verified ownership. No credentials or account identifiers are recorded.

## Recovery observed

All nine URLs submitted on October 7 now report **URL is on Google** and **Page is
indexed** in individual URL Inspection. This confirms indexing at inspection
time; it does not establish search rank or explain why Google indexed a page.

| Previously submitted URL | October 25 individual result |
| --- | --- |
| `/pwi/architecture-layers/csharp/` | Indexed |
| `/pwi/architecture-layers/python/` | Indexed |
| `/pwi/linq-query-semantics/csharp/` | Indexed |
| `/pwi/type-annotations/python/` | Indexed |
| `/tags/ai-workflow-patterns/` | Indexed |
| `/tags/asynchronous-io/` | Indexed |
| `/tags/context-compaction/` | Indexed |
| `/writing/programming-to-exceptions-logging-and-progress/` | Indexed |
| `/writing/ai-native-sdlc/` | Indexed |

The expanded C# Architecture Layers inspection reports a successful Googlebot
smartphone crawl on October 24, crawl and indexing allowed, the expected
self-canonical and Google-selected canonical as the inspected URL. It lists both
current sitemaps and the C# topic page as referring sources.

## Search clicks and impressions

The Web performance report shows **9 clicks, 1.65K impressions, 0.5% average CTR
and average position 26.3**. Both the three-month view (July 24 to October 23,
2026) and the 16-month view (June 24, 2025 to October 23, 2026) show those totals.
The September 25 baseline recorded zero clicks and impressions through September
23.

The page breakdown accounts for all nine clicks:

| Page | Clicks | Impressions |
| --- | ---: | ---: |
| [About](https://matlus.com/about/) | 2 | 28 |
| [Homepage](https://matlus.com/) | 1 | 30 |
| [Architecture Layers](https://matlus.com/pwi/architecture-layers/python/), Python | 1 | 21 |
| [C# 8 - Async Streams](https://matlus.com/writing/csharp-8-async-streams/) | 1 | 20 |
| [So You Think You Know C#? Generics Under the Hood](https://matlus.com/writing/csharp-generics-under-the-hood/) | 1 | 20 |
| [So You Think You Know C#? For vs. Foreach](https://matlus.com/writing/csharp-for-foreach/) | 1 | 16 |
| [ASP.NET Web API with WebForms](https://matlus.com/writing/asp-net-web-api-with-webforms/) | 1 | 12 |
| [Programming to Exceptions, Part 1: Method Contracts and Failure](https://matlus.com/writing/programming-to-exceptions-method-contracts/) | 1 | 8 |

The visible query table attributes one click to `matlus`. It does not identify
the queries for the other eight clicks. The page table supplies their landing
URLs without supporting an invented query attribution.

## Sitemaps and delayed summary data

| Submitted sitemap | Status | Last read | Discovered pages |
| --- | --- | --- | ---: |
| `https://matlus.com/sitemap-0.xml` | Success | October 25 | 332 |
| `https://matlus.com/sitemap-index.xml` | Success | October 21 | 332 |
| `http://www.matlus.com/sitemap.xml` | Couldn't fetch | September 10, 2024 | 143 historical |

The obsolete 2011 submission is still present. It is separate from the successful
current sitemaps and was not removed during this audit.

The Page indexing summary is last updated **October 15**: 329 indexed and 150
not indexed. Its five reasons are 138 crawled/currently not indexed, 5 not found,
3 redirects, 2 excluded by noindex and 2 discovered/currently not indexed. These
counts concern all known URLs, including alternates and historical paths. They
must not be interpreted as 150 missing articles, or compared directly with the
332 sitemap URLs. The 138-URL category was not exhaustively reclassified in this
follow-up; the October 7 inventory's Markdown-alternate findings remain historical.

## Two different pages still awaiting indexing

The remaining discovered examples are:

- [Builder Pattern and C# Expressions](https://matlus.com/writing/builder-pattern-csharp-expressions/).
  Individual inspection reports the URL unknown to Google, while the delayed
  summary lists it as discovered. Google's October 25 live test succeeds and
  reports **URL is available to Google** and **Page can be indexed**.
- [Expression Trees](https://matlus.com/tags/expression-trees/).
  Individual inspection reports discovered/currently not indexed, both current
  sitemaps, the homepage as a referring page and no recorded crawl. Its October 25
  live test also reports **URL is available to Google** and **Page can be indexed**.

Both return HTTP 200, declare their expected self-canonical, appear in the live
sitemap and contain no noindex directive. The checked site build links to them
from nine and ten distinct HTML pages respectively. No current access or indexing
directive defect was demonstrated. No repeated indexing request, validation
request or article rewrite was made to force the summary count down.

## Historical 404s and public access checks

The five reported 404 examples are four short paths (`/category/htm`,
`/scripts/webs`, `/html5-file-u`, `/NA`) and the complete old
`https://www.matlus.com/html5-file-upload-with-progress/` URL. Public requests
confirm the four short paths still return 404 after HTTPS/host normalization.
The report shows those exact short paths; they are not merely display clipping.
No reliable content match was established for them, so no redirects were guessed.

The complete HTML5-upload path now resolves to the existing HTML redirect page,
which returns 200 and refreshes to `/writing/html5-file-upload-with-progress/`.
Its noindex directive belongs to that redirect page. The destination article
returns 200 with its own canonical and no noindex directive. That old 404 report
therefore does not establish a current missing-article problem. The existing
redirect is retained.

Public `robots.txt`, sitemap index and child sitemap return 200. About, Search
and Style Guide also return 200 and currently allow indexing. The September
issue comment's proposed Search noindex change did not reach the current live
page or current source. This audit records the actual state without applying a
new search-page policy. About retains its professional introduction.

## Crawl recovery

Crawl statistics are last updated October 20. Across the Domain property they
show about 3.8K requests, 66.5M downloaded bytes and 85 ms average response time
over 90 days. The response mix is 72% HTTP 200, 17% robots.txt unavailable,
4% DNS errors, 3% 404 and 3% 301, with the remainder in other response categories.
The September baseline was dominated by robots and DNS failures.

The main `matlus.com` host has 3,282 requests, 83% HTTP 200 and 96 ms average
response time. Its host-status detail explicitly says Google has had no recent
crawling difficulty. Robots fetching is acceptable recently but was high in the
past; DNS resolution and server connectivity both show acceptable failure rates.
Retained 90-day historical failures do not establish a present outage.

Manual actions and Security issues both report **No issues detected** on October
25. Temporary Removals reports no requests submitted in the last six months.
Their September baseline remains consistent with the current reports.

## Next actions

Keep issue #3 open for the two newly identified unindexed pages and a further
reporting comparison around **November 8, 2026**. This is a recorded review date;
no recurring automation was requested or created. Recheck individual inspections,
sitemap fetches, host status and the same performance windows. An indexing request
for the two available pages is a possible next administrative action; their live
tests do not guarantee Google's indexing decision.

Review the obsolete sitemap submission separately if administrative cleanup is
desired. Retain working old-article redirects and leave unmatched short 404s
without fabricated destinations. No confirmed technical blocker requires a site
change from this follow-up. The owner's unrelated worktree remains untouched.
