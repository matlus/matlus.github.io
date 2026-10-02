# Happy-path comparison refinements

The original generation brief is in
[happy-path-comparison.prompt.md](happy-path-comparison.prompt.md).
The selected second trial is `happy-path-comparison-v2.webp`, 1672 by 941 pixels.
Both refinements used the built-in image generator. Original generated PNGs
remain in the generating chat's image archive outside the repository.

## Connector correction

```text
Use case: precise-object-edit.
Make ONE precise connector correction to this happy-path comparison. Preserve all text, cards, diamonds, colours, typography, texture, layout, aspect ratio, icon sizes, and every other connector.
In the LEFT Boolean panel, the pale grey "false" route leaving the THIRD/bottom Success? diamond currently turns upward but ends disconnected in open space. This represents a possible failed Send email result, even though it is not reached in the depicted registration failure.
Complete that pale grey route so it visibly connects with an arrowhead to the LEFT edge of the existing "Return false" box. Keep the branch entirely in clear space: run right from the third diamond, turn upward in the existing narrow open corridor, then turn right and enter the Return false box on its left edge slightly below its centre. It must not cross the red registration-failure route or overlap any label. Keep this unused route pale grey, while the active registration false path stays red.
No new box, extra text, new legend, or other changes. All three false branches in the Boolean panel must terminate at Return false. Keep Send email grey and Not reached in both panels.
```

## Explicit approach headings and captions

```text
Use case: text-localization.
Refine the attached happy-path diagram to make the two approaches immediately clear to someone learning Programming to Exceptions. Change ONLY the two panel headings and their bottom explanatory lines.
Replace the LEFT panel heading "Boolean success flags" with exactly "Without Programming to Exceptions".
Replace the RIGHT panel heading "Complete or throw" with exactly "With Programming to Exceptions".
Replace the LEFT bottom sentence "Every caller must inspect the result." with exactly "Return values require conditional checks."
Replace the RIGHT bottom sentence "Failure leaves the current path." with exactly "No conditional checks between calls."
Retain the same bold condensed upright lettering, navy colour, and title treatments. Fit each new panel heading clearly within its existing blue banner; reduce its font size slightly if needed rather than overlap another element. Keep the left and right heading sizes equal. Fit the bottom captions without clipping, keeping their font sizes equal.
Everything else stays identical: main title THE HAPPY PATH, subtitle Same work. Different failure contracts., every operation card and label, success diamonds, all connector endpoints and directions (especially all three false paths leading to Return false), corrected grey arrow into Return false, red failure path, grey Not reached email cards, boundary handler, background, panel layout, aspect ratio, colours, and fine stroke weights. No extra conditional diamonds in the right panel. No other new text or content.
```
