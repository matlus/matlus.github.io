# Validated entry points: drawing brief

Prepared October 2, 2026, from the owner's architecture image and clarification.
Combine this content brief with
[the shared flat diagram style](../../prompts/generate-flat-fine-line-diagram.md).
The architecture image supplies the component roles. This drawing explains the
paths by which incoming data becomes trusted domain data.

## Claim

"If you lock your front door and you lock your back door, you're safe in the house."

Every entry point validates the data it admits. The Domain Facade delegates to
Managers; every public Manager method uses specialized validators before doing
the work. Configuration Providers validate configuration. Gateways transform
external models into domain models and validate the result against domain
requirements. Data Managers and classes reading files also validate the data
they admit. Internal consumers rely on those contracts.

## Composition

Use a wide, flat diagram with one lightly dashed outer enclosure labelled
"Application". Inside it, show the entry-point components around a central area
labelled "Domain work" with the short explanation "Operate on validated data".
Put external data sources outside the application enclosure.

The request path enters from the left. Other data paths enter from the top,
right, and bottom. Front and back doors describe all entry points; their number
is not limited to two. Draw the roles as cards with validation steps clearly
belonging to the component that owns them.

## Exact roles and incoming paths

| Incoming source | Entry-point component | Required work before admission |
| --- | --- | --- |
| Request | Domain Facade, then Manager public method | The Facade delegates. The Manager invokes a specialized Validator before doing its work. |
| Raw configuration | Configuration Provider | Validate configuration. |
| External service models | Gateway | Transform into domain models and validate against domain requirements. |
| Database result | Data Manager and its mapper | Map and validate the store result before returning domain data. |
| File contents | Class reading the file | Parse and validate before using the data in domain work. |

Use "Every public Manager method" as the annotation on the request entry.
Keep the Domain Facade inside the application, with "Delegates" on its arrow
to the Manager. Put the specialized Validator visibly beside the Manager and
show it as the Manager's validation step. No validator belongs to the Facade.

The Gateway's incoming arrow points from the external service towards the
Gateway. Its outgoing data arrow points towards domain work and is labelled
"Domain models". The drawing's arrows describe incoming data and validation
stages, not object creation or class dependency direction.

## Outcomes

Each admitting component has a green path labelled "Valid data" towards domain
work and a red rejection path labelled "Throw" towards the appropriate outer
failure-handling boundary. Invalid data stops at that component. Do not connect
a rejected input to the domain-work area.

Inside domain work, keep the methods simple and free of repeated argument
validation boxes. Use the nearby article's link to the Validation Philosophy
chapter for the full rules and caveats. The image should explain the ownership
of validation rather than reproduce that chapter.

## Style and inspection

Use the Custom Exceptions reference's pale cool textured background, bold
condensed lettering, flat cards with delicate outlines, and clear navy
connectors. Use green for admitted data and red for rejection. Keep all labels
upright and readable, and preserve enough space to follow each incoming path.

Check that every public Manager method is covered, the Facade only delegates,
Gateway transformation and validation both appear, configuration and file input
are checked, and no external data has an unchecked route into domain work.
