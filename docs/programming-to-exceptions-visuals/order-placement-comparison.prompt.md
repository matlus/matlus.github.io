# Order-placement comparison: source-grounded trial

Prepared October 2, 2026. This replaces the earlier registration drawing brief.
The earlier trial files are retained for comparison. The owner approved
`order-placement-comparison.webp` on October 2. It is placed in the Part 1 draft;
its caption and preceding prose define boundary handler as exception-handling
middleware in a Web API. The canonical asset and this prompt are copied into
`public/images/diagrams/` for article use.

## Source and scope

The current C# order-placement Manager was inspected through qualified navigation
and validated semantic answers. Source: `ManagerOrdering.cs`, outer operation
lines 93–136 and new-order actions lines 203–233. The original domain input is
`OrderPlacementRequest`. The Manager checks that it is supplied, normalizes it,
and validates the canonical request before placement.

For a new order whose required actions succeed, the sequence is:

1. Validate the order request, including the preceding null check and normalization.
2. Place the order.
3. Publish the fulfillment notification.
4. Record fulfillment completion.
5. Send the confirmation email.
6. Record email completion.
7. Return the order reference, total, and placement status.

The source has real business and recovery branches: resubmission resolution,
new-order selection, pending-action checks, and nullable completion timestamps.
The diagram distills the new-order path; it does not claim that the source has
no conditionals. The left panel is a teaching adaptation that replaces throwing
contracts with checked failure returns. It is not a second implementation found
in the repository.

The illustrated failure is an escaping placement failure, rather than the
duplicate-reference exception that triggers resubmission handling. Placement
does not complete, so subsequent actions and the normal result are unreached.
Known post-acceptance publication or email failures can be handled under the
source's pending-work policy; this drawing does not depict those cases.

Validated source fingerprint:
`742cd7b298a2da25973d779746545bb284ebd01fe42f8cbd60b2f501f6412ab9`.
The C# checkout contained another task's edits. No production source was changed.

## Complete generation prompt

Built-in image generation; use
`docs/style-references/flat-fine-line-diagram.webp` as the style reference.

```text
Use case: infographic-diagram.
Asset type: explanatory article diagram, replacement style trial.
Input image: STYLE REFERENCE ONLY. Match its flat card treatment, bold condensed upright lettering, delicate borders, navy connectors, pale cool blue-grey textured paper and near-white centre. Do not copy its class hierarchy, class names, circle/star markers, or legend.

SUBJECT AND SCOPE
Compare the same distilled new-order workflow under return-value failure reporting versus Programming to Exceptions. The source begins with a domain OrderPlacementRequest; do not invent raw input conversion or Map to member. A validation card summarizes the boundary work: check request is supplied, normalize its values, validate the canonical request. Later cards are the success sequence of the real order example. This is a teaching comparison of high-level contracts, with resubmission and pending-work recovery policy omitted from the depicted path. Do not imply that all real business decisions disappear.

COMPOSITION AND EXACT TEXT
A generously sized, roughly square image, two equal vertical panels, with a fine neutral divider. High native resolution, large legible labels, plenty of open space around arrows. Main title: "PLACING AN ORDER". Subtitle: "Same work. Different failure contracts."
Left panel title across two lines: "Without Programming" / "to Exceptions".
Right panel title across two lines: "With Programming" / "to Exceptions".
Each panel has the following EXACT seven operation cards, aligned on corresponding rows:
1. "Validate order request"
2. "Place order"
3. "Publish fulfillment notification"
4. "Record fulfillment completion"
5. "Send confirmation email"
6. "Record email completion"
7. "Return placement result"
Wrap longer labels onto two lines rather than making lettering tiny. Small annotation directly below the first card label in BOTH panels: "Check, normalize, validate".
Small annotation in the last card in BOTH panels: "Order reference, total, status".

LEFT PANEL
Six "Success?" diamonds: one immediately after each of the first SIX cards, before the next card.
Each diamond's downward exit is labelled "true" and flows to the next operation card.
Each diamond has a left-facing "false" exit joining a continuous open-space failure rail at the left side of the panel, ending in a box "Return failure" then an arrow into a box "Caller must check". Give the whole failure rail a continuous traceable direction ending in that box. Do not leave any connector dangling.
This occurrence fails at "Place order". Mark that card red and mark its Success? diamond's false route red all the way to "Return failure" and "Caller must check".
The first validation card and first diamond true path are green/navy. All later operation cards, starting at Publish fulfillment notification, are pale grey and marked as not reached through a single clearly associated bracket labelled "Not reached". Their diamonds and unused true/false connectors are pale grey. Keep all six failure exits traceable, including the lowest diamond.
Bottom panel caption verbatim: "Return values require conditional checks."

RIGHT PANEL
Connect the same seven cards downward, WITHOUT success-check diamonds. Use longer connector gaps to keep matching operation rows aligned with the left panel.
Show Validate order request completed and Place order failing, with the same red card treatment as the left panel.
From the RIGHT edge of Place order, a clear red arrow labelled "throw" exits the workflow and routes through open space UPWARD to a distinct box near the top-right margin labelled "Boundary handler". This is exception propagation to the outer handler, not a normal return to the next operation. Do not connect it to left-panel boxes.
After Place order the normal downward connector and all subsequent connectors are pale grey dashed. The final five operation cards are grey, with one bracket labelled "Not reached". In this occurrence no fulfillment notification or email is sent and no placement result is returned.
Bottom panel caption verbatim: "No conditional checks between calls."

FOOTNOTE
At the bottom, spanning both panels, smaller but readable: "New-order path shown. Business and recovery policies remain within the operations."

STYLE AND ACCURACY
Background quiet, texture strongest near edges. Navy bold condensed main title with restrained tonal shading and fine horizontal flanking rules. Flat rounded operation cards, pale tinted fills, saturated delicate outlines about 1.3-1.5 pixels per 1820 pixels of image width. Connectors slightly heavier. No bevels, 3D, platforms, stars, circles, logos, or watermark. Keep every label, arrowhead and caption inside comfortable margins.
Both correctly implemented versions stop when placement fails. Show every specified success-check diamond on the left and none on the right. The comparison is the obligation to inspect and forward failure return values versus exception propagation. No invented customer/member mapping step. All spelling and operation order must match the brief.
```

## Connector refinement

The first rendering incorrectly attached four failure exits to operation cards.
The selected refinement attaches all six exits to their Success? diamonds and
extends both unreached brackets to include the final result.

Selected asset: 1254 by 1254 pixels, WebP, 188,236 bytes. Earlier generations
remain at their original saved paths.

```text
Use case: precise-object-edit.
Make only connector-accuracy refinements to this approved style trial of PLACING AN ORDER. Preserve the entire composition, all exact text, cards, all six Success? diamonds, colors, typography, background, and dimensions.
In the LEFT panel the four grey "false" exits for the unreached operations currently originate from rectangular operation cards. They MUST instead originate from the LEFT TIP of their associated Success? diamonds BELOW those cards:
- diamond below Publish fulfillment notification,
- diamond below Record fulfillment completion,
- diamond below Send confirmation email,
- diamond below Record email completion.
Remove each erroneous card-origin false connector, then draw a pale grey horizontal left-facing connector from that diamond's left tip to the existing vertical failure rail. Put "false" above each corrected connector. Each corrected connector ends with a left-facing arrowhead at the rail. Leave the two top false exits from the Validate and Place order diamonds exactly as they are. Keep the vertical rail continuous and keep Return failure -> Caller must check connected. Every false exit must originate in a diamond, never a rectangle.
Extend each panel's "Not reached" bracket DOWN to include the final Return placement result card as well as the preceding five unreached rectangles. The brackets should start at Publish fulfillment notification and end just below Return placement result; keep the bracket and label clear of captions.
No other changes. No new labels or shapes, no watermark.
```

## Inspection

Seven operation cards appear in the correct order on each side. The left has six
Success? diamonds, with six false exits connected to the failure rail. The right
has no success-check diamonds; its red throw arrow reaches the boundary handler.
Both panels stop after placement fails and mark the final five steps as unreached.
All specified labels and captions are present.
