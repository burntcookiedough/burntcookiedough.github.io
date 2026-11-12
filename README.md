# burntcookiedough.github.io

Portfolio of **Anshul Panigrahi**, AI engineer building LLM products and tool-using agents.

Live at **https://burntcookiedough.github.io/**

Hand-built HTML, CSS and JavaScript with no framework. The scenes (the city, the planet, the hallway and the clouds) are drawn procedurally on canvas.

## Editing

All content lives in [`projects.js`](projects.js): name, role, links, resume URL, projects, milestones, patents and the text profile. After changing it, regenerate the files that search engines and AI agents read, then push:

```
node tools/agent-files.mjs
```

GitHub Pages redeploys automatically. When a change should reach returning visitors at once, bump the `?v=` numbers in `index.html`.

| File | What it holds |
| --- | --- |
| `index.html` | Page structure, plus two generated blocks (metadata and structured data; a plain-HTML profile) |
| `style.css` | Design tokens, layout, responsive rules |
| `main.js` | Scenes, scroll engine, loader, patent reader |
| `projects.js` | Content |
| `patents/` | Patent publications: the PDFs and the page images the reader shows |
| `tools/agent-files.mjs` | Generates everything below from `projects.js` |

## For search engines and agents

The scenes are drawn with JavaScript, so the same content is also published as text:

| File | For |
| --- | --- |
| [`llms.txt`](https://burntcookiedough.github.io/llms.txt) | AI agents: a short map of the profile ([llmstxt.org](https://llmstxt.org)) |
| [`profile.md`](https://burntcookiedough.github.io/profile.md) | The whole portfolio as one Markdown document |
| [`resume.json`](https://burntcookiedough.github.io/resume.json) | The resume in [JSON Resume](https://jsonresume.org) format |
| `index.html` JSON-LD | Search engines: `Person`, projects and patents as schema.org data |
| `index.html` plain profile | Crawlers and readers without JavaScript; removed when the scenes load |
| `og.jpg` | The preview image for links shared on LinkedIn, Slack, WhatsApp, X |
| `robots.txt`, `sitemap.xml` | Crawl rules (all welcome, AI crawlers included) and the page list |
