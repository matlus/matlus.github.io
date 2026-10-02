# Happy-path comparison: first style trial

Prepared October 2, 2026. Use the built-in image generator with
`docs/style-references/flat-fine-line-diagram.webp` as a style reference.
This is a trial for review before selecting an article image.

```text
Use case: infographic-diagram.
Asset type: explanatory article diagram, first visual trial.
Input image: the supplied Custom Exceptions diagram is a STYLE REFERENCE ONLY. Create an entirely new workflow comparison. Its hierarchy, class names, circle/star markers, and legend are not content for this drawing.

VISUAL STYLE
Match the reference's pale cool blue-grey textured paper, softly white centre, subtle edge vignette, bold condensed upright sans-serif lettering, navy main title with restrained tonal shading, fine horizontal title rules, flat rounded cards with very pale tinted fills and delicate coloured outlines, and crisp navy connectors. Keep outlines about 1.3–1.5 px at 1820 px width, proportionally scaled; connectors are slightly heavier. Keep the texture quiet. No 3D platforms, no bevels, no thick shadows, no abstract-class circles or concrete-class stars. Make text large and legible, with comfortable padding and ample margins.

SUBJECT
Explain Programming to Exceptions through a comparison of the SAME registration workflow under two failure contracts. Both correct implementations stop after registration fails. Only the Boolean-returning implementation requires repeated success checks and forwarding of failure values. Throwing prevents ordinary continuation without a success check. Show the example failure at Register member in BOTH panels, and Send email unreached in BOTH.

COMPOSITION
Landscape, roughly 16:10, high native resolution. Two equal-width panels with a vertical reading order. A very thin neutral vertical divider separates them. Top heading, verbatim: "THE HAPPY PATH".
Small subtitle, verbatim: "Same work. Different failure contracts."
Left panel heading, verbatim: "Boolean success flags".
Right panel heading, verbatim: "Complete or throw".
Each panel has the same four rectangular operation cards in this exact order: "Validate input", "Map to member", "Register member", "Send email". Keep corresponding operation rows aligned between panels. Repeated success-check diamonds make the left sequence longer; use longer unobstructed connectors in the right sequence to maintain corresponding card alignment. Keep Map to member as a data-producing operation without a Boolean success-check diamond.

LEFT PANEL — EXACT STRUCTURE
Validate input -> a diamond "Success?".
Its "true" path goes to Map to member, then Register member -> a second diamond "Success?".
The second diamond's "true" path goes to Send email -> a third diamond "Success?".
A small "Continue" label indicates that a true result from the third diamond allows the caller's next operation.
Every "false" exit from a success diamond routes into an open-space failure rail and then a box "Return false". Give each route an identifiable origin and direction, without crossing unrelated cards or text.
Return false -> a separate small box "Caller must check".
In this depicted occurrence, validation and mapping completed. Register member fails: mark its card with red text or a small red X and a small adjacent label "Fails here". Highlight the second diamond's false path to Return false and Caller must check in red. The first diamond's true path is navy. The second diamond's true path, Send email, and third diamond are pale grey; Send email includes the small text "Not reached". The unused first and third false routes remain very pale but traceable.
Left bottom explanatory line, verbatim: "Every caller must inspect the result."

RIGHT PANEL — EXACT STRUCTURE
Validate input -> Map to member -> Register member -> Send email.
There are NO success-check diamonds in this panel.
Validate input and Map to member have navy connecting arrows and quiet green outline treatment.
Register member is marked with the same red failure treatment and adjacent label "Fails here".
An outward red arrow from Register member is labelled "throw" and goes to a separate side box "Boundary handler". It represents propagation out of the current workflow, not a normal result returned to the next operation.
The normal connector from Register member to Send email is grey and dashed. The Send email card is pale grey and includes the small text "Not reached". Any continuation beneath it is grey.
Right bottom explanatory line, verbatim: "Failure leaves the current path."

ACCURACY
The successful order is validate, map, register, email. Do not imply that exception handling sends the email after failed registration. Do not imply that checking Boolean flags correctly leaves the email running after failure. The comparison is caller obligations versus exception propagation. No extra steps, arrows, labels, legends, logos, or watermark. Exact specified lettering, correctly directed connectors, readable failed and unreached states.
```
