# Equation Audio Guide

Equation Audio Guide turns technical articles into editable spoken scripts. It
is for teachers, learners, and technical writers who need to explain equations
and code aloud.

Live site: <https://equation-audio-guide.sociobot.in>

## Try the sample

Open <https://equation-audio-guide.sociobot.in/demo> or choose **Try it with
sample data** on the landing page. The demo opens a gradient-descent article
with prose, math, code, a table, and a figure description. It uses separate
`demo:` browser storage and does not change real working data.

The demo banner includes **Reset demo** and **Start for real**. Details are in
[`.factory/demo.md`](.factory/demo.md).

## What it does

- Creates editable scripts from Markdown, LaTeX, MathML, code, tables, and
  figures.
- Repeats the same suggestion for the same source and flags notation that needs
  author review.
- Records needs-review, approved, and revised states for each script segment.
- Downloads review scripts as plain text or Markdown.
- Keeps a working copy in browser local storage and works offline after the
  first visit.
- Does not send entered article text over the network. It uses no account,
  synthetic audio, third-party runtime assets, or tracking.
- Keeps raw article HTML as text instead of running it.

The output is an authoring aid. It does not replace every screen reader. Review
the final script before publishing.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Use `/demo` for the isolated sample or paste an
article into the regular editor. Press `Ctrl`/`Command` + `Enter` to build a
script.

## Test and build

```sh
npm test
npm run build
```

`npm test` runs parser tests and browser tests for desktop and 390px mobile
Chromium. It includes accessibility scans, demo isolation, export, privacy,
offline reload, and recovery checks. `npm run build` writes the deployable
static site to `dist/`, with `dist/index.html` at its root.

Run each visitor claim from a clean setup with the commands in
[`.factory/claims.json`](.factory/claims.json). Each command starts with the
isolated `/demo` route.

To inspect the production build locally:

```sh
npm run preview
```

Deploy the contents of `dist/` to Azure Static Web Apps. The repository does
not manage infrastructure, DNS, or billing.

## Privacy and project files

The [privacy policy](https://equation-audio-guide.sociobot.in/privacy/) explains
browser storage and normal static-site requests. The
[terms](https://equation-audio-guide.sociobot.in/terms/) explain the limits of
suggested narration.

- Product brief: [`.factory/brief.json`](.factory/brief.json)
- Visual system and art provenance: [`.factory/design.md`](.factory/design.md)
- Demo contract: [`.factory/demo.md`](.factory/demo.md)
- Public-claim tests: [`.factory/claims.json`](.factory/claims.json)
- Build handoff: [`.factory/handoff.md`](.factory/handoff.md)
- License: MIT, in [`LICENSE`](LICENSE)
