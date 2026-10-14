# Website typography

Shiv approved the Google typography trial on October 13, 2026, using the
full article width. The shared styles apply it throughout the website.

Google Sans Flex supplies body text, headings and interface text. Google Sans
Code supplies inline code, fenced listings and italic quotations. Fonts are
served from this website, with system fallbacks for unavailable glyphs.

| Setting | Value |
| --- | --- |
| Body text | 17px, weight 400, 24px line height |
| Paragraph gap | 16px |
| Article headings | 20px, weight 470, 24px line height |
| Space above article headings | 40px, except the first heading |
| Space below article headings | 8px |
| Consecutive heading gap | 8px |
| Bold prose | Weight 540 |
| List-item gap | 12px |
| List indentation | 40px per level |
| Code text | 15px, 24px line height in fenced listings |
| Inline-code padding | 4px vertically, 6px horizontally |
| Quotation text | 17px italic Google Sans Code, 24px line height |

Body text uses the Flex axes `ROND=0`, `slnt=0` and `wdth=92`. Headings use
`ROND=20`, `slnt=0` and `wdth=94`. Ordinary italics use `slnt=-10`. CSS font
weight controls the weight axis, so component weights and bold text still work.
Optical sizing is automatic. Page titles and interface sizes retain their
existing scale. The Matlus wordmark retains its custom font.

Article paragraphs, headings, callouts, tables and code fences fill their
existing article column. The hero, title block and article body share a left
edge. The sidebar occupies its own column on wide screens. Narrow screens
stack the layout, and wide code or tables scroll inside their own containers.
The chatbot's 708px text limit and the experiment controls are absent from the
published styles. Article text, code examples, dates and images are preserved.

## Font files and provenance

The three Latin WOFF2 subsets are the exact assets used in the approved preview.
They were downloaded from Google's font service on October 13, 2026.

| Local file in `public/fonts` | Source |
| --- | --- |
| `google-sans-flex-latin.woff2` | [Google Sans Flex v23](https://fonts.gstatic.com/s/googlesansflex/v23/t5t2IQcYNIWbFgDgAAzZ34auoVyXkJCOvp3SFWJbN5hF8LG572o.woff2) |
| `google-sans-code-latin.woff2` | [Google Sans Code v22](https://fonts.gstatic.com/s/googlesanscode/v22/pxihyogzv91QhV44Z_GQBHsGf5PuckJMZfIVTPZaiXEp_ht12EVEHsN1sCQNcmTltAki.woff2) |
| `google-sans-code-italic-latin.woff2` | [Google Sans Code Italic v22](https://fonts.gstatic.com/s/googlesanscode/v22/pxijyogzv91QhV44Z_GQBHsGf5PuWEt-oWZnOk-ljWSpwaFB6rqcd6jvHiMYuic98Dkg_uM.woff2) |

Each family uses the SIL Open Font License 1.1. The original license notices
are retained beside the font files as `google-sans-flex-OFL.txt` and
`google-sans-code-OFL.txt`, copied from the corresponding
[Flex](https://github.com/google/fonts/tree/main/ofl/googlesansflex) and
[Code](https://github.com/google/fonts/tree/main/ofl/googlesanscode) directories.
The shared font stylesheet declares the Flex weight and width ranges and the
regular and italic Code faces. The body font is preloaded by the base layout.
