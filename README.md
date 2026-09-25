# matlus.com

Source for [Shiv Kumar's website](https://matlus.com/), published with Astro and GitHub Pages.

The site collects [Programming With Intent chapters](https://matlus.com/pwi/), [articles](https://matlus.com/writing/), and [pages with video or audio companions](https://matlus.com/media/). The recordings are on [Shiv's YouTube channel](https://www.youtube.com/channel/UC1PhnlVt1hE1UrmOsZwblig). Articles that draw on a public code repository link to that source where it is discussed.

## Local development

```sh
npm install
npm run dev
```

Before publishing, run:

```sh
npm run typecheck
npm run build
python tools/audit-copy.py src docs prompts
python tools/check-tags.py
```

The publishing and cross-linking rules are in [AGENTS.md](AGENTS.md).
