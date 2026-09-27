# CPU Cache and DRAM illustration

Reconstructed from the supplied slide using a written drawing brief. The built-in
image generation tool received only the approved pastel illustration as an image
reference. It did not receive the CPU slide. The CPU content below was described
by the assistant after inspecting the slide.

## Specific generation prompt

```text
Use case: infographic-diagram.
Create a high-resolution landscape illustrated article diagram, ideally 3840x2160 if supported. The supplied image is a STYLE REFERENCE ONLY. Use its softly illustrated pastel architectural aesthetic: cool ivory paper and subtle watercolor grain, dark navy readable upright sans-serif text, fine blue linework, translucent mint and soft blue, butter-yellow and salmon-coral accents, rounded shallow dimensional platforms, layered glasslike tinted rims, gentle shadows, generous space and faint architectural drafting lines near the edges. Keep the title balanced and readable, similar in scale to the reference's moderate heading; do not use an oversized headline. Do not copy any testing content or arrows from the reference.

Reconstruct the following diagram from this written description. Title exactly "CPU Cache and DRAM". Preserve every specified component, number, label, left/right pairing and vertical relationship. It is a memory/cache hierarchy and arrangement; there are NO arrows or connection paths in this source design, so do not add any.

LANDSCAPE COMPOSITION:
Reserve approximately the left quarter for annotations and three slim vertical side blocks. The remaining three quarters form a wide hierarchy with exactly FOUR equal-width CPU-core columns at the bottom, arranged as TWO close pairs with a slightly wider central gap. All four CPU Core platforms share the same baseline and are separately visible. A slim vertical pipeline block also appears at the extreme right, beside core 4.
One broad DRAM block spans the full width of all four core columns near the upper part of the diagram. Below DRAM is a generous vertical gap. Below that gap is ONE shared slim L3 cache block spanning the same full width of the four columns. Directly beneath L3 is a row of FOUR separate L2 cache blocks, each precisely aligned above its corresponding core column. Directly beneath each L2 block is a row of TWO side-by-side smaller cache blocks. Directly beneath that two-block row is that column's larger CPU Core block.
Maintain these stacked adjacencies. The figure must visibly have ONE DRAM, ONE L3, FOUR L2, FOUR Instruction Cache blocks, FOUR L1 Cache blocks, and FOUR CPU Core blocks. Do not merge or omit duplicates.

EXACT LABELS:
Broad top block: "DRAM".
Shared L3 block has two centered lines: "L3 Cache (Inst.+Data)" and "4MB-24MB".
Each of the FOUR separate L2 blocks has two centered lines: "L2 Cache (Inst.+Data)" and "256KB".
Each column's SMALL LEFT cache block has three centered lines: "Instruction", "Cache", "32KB".
Each column's SMALL RIGHT cache block has two centered lines: "L1 Cache", "64KB".
Each of the FOUR larger bottom blocks reads "CPU Core".

SIDE BLOCKS:
To the LEFT of core 1, place exactly three tall slim standalone blocks aligned with the core and its small cache row, in this left-to-right order: "Branch Predictor", "Pre-Fetcher", and a two-line "Instruction Pipeline" / "16 stage". These are outside the four core columns and below the left annotation card. Use vertical rotated labels if necessary to match the slim shapes.
To the RIGHT of core 4, place ONE corresponding tall slim block labelled "Instruction Pipeline" / "16 stage". Do not duplicate Branch Predictor or Pre-Fetcher on the right.
Those two Instruction Pipeline side blocks are independent flanking components, not extra CPU cores.

ANNOTATIONS IN THE LEFT MARGIN:
Near the top left, alongside DRAM, show these exact three readable lines:
"3.3 GHz CPU"
"4 instructions/cycle"
"13.2 billion instructions/sec/core"
Further down at the far left, beside the slim side blocks, retain this note:
"Super scaling"
"Multiple execution units performing"
"2 or more independent instructions"
Use a clean pale annotation panel or vertically orient this lower note if needed. Keep it apart from Branch Predictor, Pre-Fetcher and the left Instruction Pipeline.

STYLE APPLICATION:
DRAM: large pale mint rounded dimensional slab; shared L3: thin mint/teal slab. L2: pastel coral slabs. Instruction Cache: pale butter-gold tiles. L1 Cache: soft coral tiles. CPU Core: larger warm gold rounded shallow dimensional blocks, four visually equal. Side blocks can use mint, coral and gold respectively. These color choices replace the source slide's colors while retaining its content. All technical labels must remain upright/readable except the deliberately vertical side labels. Use restrained shallow perspective to preserve alignment and the four-column count. Add the reference's soft illustrated depth, rim highlights and paper treatment without adding extra functional hardware.
No cache-size changes, extra architecture claims, diagram arrows, invented explanatory text, source-slide footer, page number, editor guides, spellcheck underlines, corporate classification footer, watermark or logo. The numbers are a faithfully reproduced example, not a newly asserted universal CPU specification.
```

## Verification

The selected image retains four CPU cores, four L2 caches, four Instruction Cache
blocks and four L1 Cache blocks, one shared L3 cache, one DRAM layer, the two
flanking instruction pipelines, and the left Branch Predictor and Pre-Fetcher.
The left annotations retain the supplied numeric example and superscaling note.
The source contains no arrows, so none were added. Its slide footer and editor
guides are omitted from this diagram study.

These values reproduce the supplied example. They are not a claim about every CPU.

## Retained asset

`cpu-cache-and-dram.jpg` is the native 1672 by 941 JPEG export, quality 95
with no chroma subsampling or resizing. It is reserved for a future performance
article. The approved style reference is
`functional-acceptance-testing-at-the-boundary.jpg` in this folder.
