# Design articles: publication

The owner approved publishing the six reviewed Design articles on October 5,
2026. Both datePublished and dateModified equal the original source video's
public calendar date. Publication does not promote these articles to the newest
positions in the existing chronological feeds.

## Articles and source associations

| Article | Both dates | Source video | Public code |
|---|---|---|---|
| [Adapter Design Pattern: Testing Service Bus Using RabbitMQ Locally](https://matlus.com/writing/adapter-pattern-rabbitmq/) | 2020-06-21 | [Recording](https://www.youtube.com/watch?v=xHDoQvhW9VQ) | [Message broker adapters](https://github.com/matlus/Adapter-Design-Pattern-Message-Brokers) |
| [Builder Pattern and C# Expressions](https://matlus.com/writing/builder-pattern-csharp-expressions/) | 2020-07-12 | [Recording](https://www.youtube.com/watch?v=lEqPX6_Q-qw) | [Builder examples](https://github.com/matlus/Builder-Pattern-and-CSharp-Expressions) |
| [Creating Instances, Using Inheritance: No Thank You!](https://matlus.com/writing/creating-instances-using-inheritance/) | 2020-12-13 | [Recording](https://www.youtube.com/watch?v=80EYfd582PQ) | [MovieService](https://github.com/matlus/MovieServiceYouTube), supplementary model examples |
| [Abstraction in Software Design](https://matlus.com/writing/abstraction-in-software-design/) | 2021-02-13 | [Recording](https://www.youtube.com/watch?v=hOrpppzEX14) | [Message broker adapters](https://github.com/matlus/Adapter-Design-Pattern-Message-Brokers) |
| [SOLID IS OLD: Dependency Inversion Needs a Good Abstraction](https://matlus.com/writing/solid-is-old/) | 2021-02-21 | [Recording](https://www.youtube.com/watch?v=IZ_7K7XOABM) | [MovieService](https://github.com/matlus/MovieServiceYouTube), supplementary; the TV application is not identified as this repository |
| [Abstraction in Software Design, with Examples](https://matlus.com/writing/abstraction-in-software-design-examples/) | 2021-02-28 | [Recording](https://www.youtube.com/watch?v=mkn7ry-ZZdM) | [MovieService](https://github.com/matlus/MovieServiceYouTube) and [OneToManyMapBenchmark](https://github.com/matlus/OneToManyMapBenchmark) |

The articles teach their subjects directly and retain video and repository
resources separately. Public source associations are checked before adding
backlinks. Original video descriptions and README text are preserved. Related
articles using supplementary examples are described as related reading rather
than attributed to an unavailable historical application.

## Editorial and technical verification

The repository blog-writing skill governs all six articles. The mandatory
metadata agent re-read the complete publication copies against
`prompts/extract-description-and-tags.md`; all six descriptions and tag sets
remain valid. The three new topics are Message Brokers, Expression Trees and
Dependency Inversion. Each has its own saved hero prompt and optimized image.
Dependency Inversion and Dependency Injection remain separate established concepts.

Six prepared article heroes use the shared 60:13 display frame and depict distinct
article-specific relationships. Three SVGs reproduce inspected source drawings;
four additional explanatory figures accompany the code. The
[diagram briefs](drafts/design-series/diagram-briefs.md) record source frames,
preserved relationships and legibility changes. All have descriptive alternative
text and captions. The
[preparation register](design-series-preparation.md) and
[verification record](drafts/design-series/verification.md) retain the source
coverage, visual review and 34 grouped C# behavior checks. No article code changed
during publication. Historical broker SDKs, incomplete settlement and cleanup,
unexecuted SQL and the original mapper's ordering assumption remain qualified.

Publication runs the six repository checks against the activated collection:
typecheck, link-policy tests, full build, copy audit, tag validation and generated
links. Generated HTML and Markdown must retain both original dates. Feed checks
must confirm historical placement instead of a new-article position.

The publication PR for `codex/publish-design-series` records the merge SHA,
matching GitHub Pages run, live article/date/asset verification, and source-video
and public-repository backlink receipts. Backlinks are added after the canonical
article URLs become available. Evidence remains outside this public repository
under `D:/Source/Workspaces/matlus-design-2026-10-04/verification/`.

Service Interface Layer Pattern remains outside this six-article batch.
