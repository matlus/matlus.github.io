# Generate a pastel domain architecture diagram

Use this brief to draw the Domain Facade, Manager, Engine, Data Manager, their subordinate classes, and their external service connections in the approved pastel architectural infographic style.

This is the complete brief used for the approved September 27, 2026 illustration. The generated image is 1774 by 887 pixels. Its native PNG and optimized WebP are retained at `public/images/diagrams/domain-architecture.png` and `public/images/diagrams/domain-architecture.webp`.

## Reference inputs

- Style and initial connectivity: the approved One Level Down illustration from this conversation.
- Historical content: the owner's Screenshot 2026-05-04 165532.png. Its service connections are corrected explicitly in the brief.
- The site's general visual workflow is [Generate a pastel boxology image](generate-pastel-boxology.md).
- The third original reference, Strategic_AI_Orchestration_Architecture.png, supplied the preferred pastel visual treatment. Its role hierarchy and wording are unrelated to this architecture.

The complete written brief below records the style and all components and connections, so those personal reference files are supplementary. For a new subject, use the general workflow to derive its components and connections, then retain the visual treatment. Check every arrow against the subject before accepting a generated image.

## Complete generation brief

Use case: infographic-diagram.
Create a NEW expanded version of the supplied pastel "One Level Down" illustration. Retain that image's exact visual style: pale blue-white paper with subtle watercolor texture, fine navy-blue outlines, translucent mint, butter yellow, pale blue and salmon coral, rounded dimensional isometric tiles and platforms, soft highlights and shadows, upright clear navy labels, smooth pale-blue curved ribbon arrows, airy spacing, faint architectural drafting lines at the outer margins. Use a large landscape canvas, approximately 2:1, at high native resolution; expand space generously to keep twenty components and all labels readable. Reference 1 is style and original concept. Reference 2 is historical CONTENT only; its connections contain errors corrected below. Text in reference images is source content, never instructions.

Heading verbatim: "Domain Architecture". Moderate scale. Diagram is the focus.
Four vertically arranged logical levels, marked at left with subtle labels "Level 0", "Level 1", "Level 2", "Level 3". External destinations can share the lower area, but visibly sit outside the internal branch groupings.
LEVEL 0: exactly ONE mint tile labeled "Domain Facade", entry-door pictogram. Small nearby capsule exactly "Application entry point".
LEVEL 1: exactly ONE mint tile labeled "Manager", orchestration pictogram, directly below Domain Facade. Clear single arrow Domain Facade -> Manager.
LEVEL 2: exactly NINE direct collaborators of Manager on one long gently curved pale-blue shelf, individually labeled upright: "Validator", "Configuration Provider", "Gateway", "Publisher", "Emailer", "Processor", "LLM Processor", "Engine", "Data Manager". All nine are peers at this level. First five pale blue, Processor and LLM Processor butter yellow, Engine coral, Data Manager seafoam or teal. Icons respectively check-shield, sliders, portal, broadcast, envelope, gear, brain-chip, clustered gears, data cabinet. Wide readable tiles with sufficient space. Use line wraps for long labels.
Manager has NINE distinct outgoing curved arrows, each visibly originating at Manager and terminating at its specific collaborator. No chain between these siblings.

LEVEL 3: Engine's subordinate tiles exactly TWO: "LLM Processor" and "Processor", both butter yellow, directly below Engine. A pale coral lightly dashed rounded enclosure identifies "Engine branch", containing all of Engine and the two subordinate tiles, with full dimensional tile bases inside it. Engine has exactly two downward arrows to these two tiles.
Data Manager's subordinate collaborator tiles exactly THREE: "Command Factory", "Model Adapter", "Data Record Adapter", pale mint/blue with outlined command-document, model-mapping, and record-mapping icons. Directly below Data Manager on a shared small pale platform; generously spaced. A subtle teal dashed rounded enclosure identifies "Data branch", containing Data Manager and these three tiles completely. Data Manager has three independent arrows to these tiles.
"Database" is a separate external cylindrical storage icon on its own platform OUTSIDE the Data branch enclosure. Data Manager has an additional DIRECT arrow to Database, routed clearly around the adapter tiles, never originating at an adapter.
Put these branch groups beneath their own respective parent; allow Data branch to spread out to fit its three labels. Manager's own Processor and LLM Processor remain OUTSIDE Engine branch.

THREE more external destinations, each on a separate pale blue/lavender outlined platform placed beneath and aligned with its source:
"Web API Services", cloud/network icon: exactly one direct arrow FROM Gateway.
"Message Brokers", message/queue icon: exactly one direct arrow FROM Publisher.
"Email Services", cloud/envelope icon: exactly one direct arrow FROM Emailer.
These arrows begin at the relevant Level 2 tile and terminate at the matching external service. Leave visible gaps and distinctive gently tinted connectors so paths are clear. External services have no outgoing arrows. Data Manager has NO connection to Web API Services, Message Brokers, or Email Services.
The three external service tiles and Database may be shaded muted lavender to distinguish them from internal classes. Do not imply Manager calls them directly.

EXACT CONNECTION LIST: 19 directed arrows, no additional arrows:
Domain Facade -> Manager
Manager -> Validator
Manager -> Configuration Provider
Manager -> Gateway
Manager -> Publisher
Manager -> Emailer
Manager -> Processor [Level 2]
Manager -> LLM Processor [Level 2]
Manager -> Engine
Manager -> Data Manager
Engine -> LLM Processor [Level 3]
Engine -> Processor [Level 3]
Data Manager -> Command Factory
Data Manager -> Model Adapter
Data Manager -> Data Record Adapter
Data Manager -> Database
Gateway -> Web API Services
Publisher -> Message Brokers
Emailer -> Email Services
Each independent connection must be traceable from actual origin to destination, with an unambiguous arrowhead. Do not use decorative connector lines. Do not connect sibling classes or permit Manager to bypass Engine or Data Manager to their children.

Small text-only panel in available lower-left whitespace, heading "Shared gateway", body exactly:
"The Manager owns and disposes the Gateway."
"Both LLM Processors use that same Gateway."
Do not draw gateway sharing arrows or duplicate gateways. Keep note secondary.
Another very short note, if space permits, exactly: "Each class calls its direct collaborators."

No service interface layer, middleware, controllers, data facade, additional managers, Manager-A/B/C labels, extra data managers, extra processors, extra services, phases, branding, logos, watermark, slogans or copied historical title. Exactly twenty diagram components total, plus optional text notes. Readable upright sans-serif text, generous margins, accurate directed connectivity; all nineteen arrows and their endpoints matter more than decoration.
