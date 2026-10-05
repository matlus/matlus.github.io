# Design article diagram briefs

The five preparation figures are new explanatory diagrams based on verified source contracts
and the teaching examples. They are not reproductions of slide artwork. They use
the pastel architectural palette, upright navy labels, fine blue outlines and
clear relationship types from the repository's boxology prompt.

## Source reproductions added for publication, October 5

The owner requested faithful inline reproductions in addition to creative,
article-specific heroes. Three source drawings were inspected in the public
recordings and reproduced as readable SVGs. Screenshots are retained in the
external verification workspace.

- `design-adapter-source.svg`: Adapter recording near 3:07. Preserves Client,
  Adapter (interface), Implementation 1/2 and Adaptee 1/2, their placement and
  connectors. The source's diamonds remain at the adaptee ends; they have not
  been silently repositioned to impose standard UML notation. The prose explains
  ownership. This replaces the preparation contract diagram in the article.
- `design-movie-schema-source.svg`: Abstraction Examples near 28:00. Preserves
  Movie, Genre and AssocMovieGenre, all fields, key connections and unique-title
  markers. Textual PK/UQ markers replace the small key/pointing-hand icons for
  readability, with a legend. The public SQL confirms the composite primary key
  and foreign keys; its physical association table includes an underscore.
- `design-system-boundary-source.svg`: SOLID at 24:05. Preserves the dashed
  system enclosure, Service Interface Layer and database outside it, all three
  managers/data managers, both labels reading Domain Facade, and the selected
  B branches with their collaborators. No inferred Service Interface arrow is
  added where the source draws none.

The other four published explanatory figures supplement the complete code and
prose; they are not claimed as slide reproductions. Hero review confirmed six
distinct concepts: interchangeable broker connections, precise test arrangements,
state cards with reusable behavior, a simple observatory control surface,
replaceable broadcast infrastructure, and assembled movie records. Review the
actual shallow page crop as well as the complete source artwork.

- **Adapter contracts:** one application; publisher and subscriber base contracts;
  two concrete descendants for each; SDK ownership stated inside each descendant.
  Caller arrows point toward contracts; implementation arrows point from
  descendants toward contracts. Ownership is text, not an ambiguous UML diamond.
- **Builder states:** three independent columns: absent key, present value,
  present null. Each leads to its own construction result. No implied transition
  from one column to another.
- **Abstraction boundary:** application Message, Publish contract, then two
  implementations mapping to their own SDK data. Labels identify actual calls.
- **Dependency inversion:** before and after source-reference diagrams, with a
  separate dashed runtime-call path. The domain contract is shared; runtime
  control still reaches the selected implementation.
- **Movie gateway:** three named response shapes enter one gateway boundary;
  concurrency, response checks, join and model mapping occur inside. One domain
  Movie shape leaves for the caller. Data arrows are labeled as returned data.
