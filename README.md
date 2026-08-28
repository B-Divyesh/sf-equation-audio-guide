# Equation Audio Guide

Equation Audio Guide turns a technical article into an ordered, editable narration script. It is for teachers, learners, and technical writers who need to explain equations and code aloud without accepting a poor symbol-by-symbol reading.

Live: https://equation-audio-guide.sociobot.in

## What it does

- Parses Markdown prose and headings, inline or display LaTeX, MathML, fenced/inline code, Markdown tables, and figures.
- Proposes deterministic spoken math and line-based code chunks without solving equations or calling an AI service.
- Flags readings that need author judgment, including vertical bars, implicit multiplication, paired signs, matrices, raw slashes, and unsupported LaTeX commands.
- Keeps every suggested phrase editable and tracks each segment as needs review, revised, or approved.
- Exports the ordered route and unresolved checklist as plain text or Markdown.
- Saves the working copy in local browser storage and caches the app for offline use. Article content is never uploaded.

The output is an authoring aid, not universal screen-reader output. Authors should test final publications with the people and assistive technologies they serve.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the URL printed by Vite. Use **Load example** for a representative article or paste your own source. `Ctrl/Command + Enter` builds the spoken route from the source field.

## Test and build

```sh
npm test
npm run build
```

`npm test` runs deterministic parser tests plus Playwright browser tests in desktop and 390px mobile Chromium profiles, including axe accessibility scans and an offline reload. The exact production build command is `npm run build`; it writes the deployable static site to `dist/`, with `dist/index.html` at its root.

To inspect the build locally:

```sh
npm run preview
```

Deploy the contents of `dist/` to Azure Static Web Apps. `public/staticwebapp.config.json` supplies the navigation fallback, security headers, and asset caching policy. This repository does not manage infrastructure, DNS, or billing.

## Privacy and project notes

The app has no analytics, accounts, payment, third-party runtime scripts, or remote fonts. The [privacy policy](https://equation-audio-guide.sociobot.in/privacy/) explains browser-local storage; [terms](https://equation-audio-guide.sociobot.in/terms/) explain the limits of suggested narration.

- Product brief: [`.factory/brief.json`](.factory/brief.json)
- Visual system and generated-art provenance: [`.factory/design.md`](.factory/design.md)
- Build handoff and verification: [`.factory/handoff.md`](.factory/handoff.md)
- License: MIT, in [`LICENSE`](LICENSE)
