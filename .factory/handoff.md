# Equation Audio Guide — build handoff

## Review 1 addendum — FAIL (2026-09-05)

Independent review against live <https://equation-audio-guide.sociobot.in/> **FAILED** with **7 findings** and **11 untested public claims**. The live JS, CSS, and service worker match implementation candidate `d74e66aef8a5ff172d4aa5daddb24b158dcc7855`; documentation HEAD is `6852b6584a64dbdb58f79906ca425a9cb8b695ba`.

The core live editor, populated example route, invalid/recovery/boundary paths, keyboard focus, reduced motion, same-origin request smoke check, and live offline reload work. Release acceptance remains blocked by: no isolated one-click demo; no claims manifest or claim-tagged proof; a failing clean `npm test` (mobile serious contrast failures and local service-worker-controller timeout); no designed 404; incomplete metadata/demo sitemap/title; and missing plain-words copy audit. See [`.factory/review-1.md`](review-1.md) for exact evidence and repairs.

## Independent verification addendum — PASS

Verified on 2026-08-28 against candidate `d74e66aef8a5ff172d4aa5daddb24b158dcc7855` and <https://equation-audio-guide.sociobot.in/>. **PASS**: clean locked install, all 19 unit and 13 browser tests, exact production build, independent full workflow/recovery tests, desktop and 390px checks, keyboard/focus/reduced-motion, axe serious/critical scans, live headers/cache/privacy/network checks, bundle budgets, and live PWA offline reload/service-worker update all passed. The live CSS, JS, and service worker match `dist/` (including byte-identical `sw.js`).

Detailed evidence, commands, metrics, and the one non-release Vite-preview caveat are in [`.factory/verification.md`](verification.md). No product code was changed by verification.

Work order: `equation-audio-guide-build-1`

Completed: 2026-08-28

Artifact: static web app (`dist/`)

## What shipped

- A complete local-first editor for Markdown articles containing prose, headings, inline/display LaTeX, MathML, inline/fenced code, Markdown tables, and figures.
- Deterministic narration for common mathematical structure (fractions, roots, scripts, Greek letters, comparisons, sums, products, integrals, limits, matrices, and operators) plus numbered, symbol-expanded code chunks.
- Explicit ambiguity checks for vertical bars, leading negatives, implicit multiplication, paired signs, matrices, raw slashes, unsupported LaTeX, dense code, tables, and figure descriptions.
- An ordered human review flow: editable narration, per-note checkboxes, needs-review/revised/approved stamps, open-check filters, next-check navigation, and suggestion restoration.
- Plain-text and Markdown exports containing the source excerpt, edited spoken route, review state, and unresolved checklist. Clipboard export includes a failure fallback.
- Local browser persistence, confirmed destructive clearing, an offline status, and a service worker that precaches the built shell and runtime assets. No article text is transmitted.
- Responsive 390px and desktop layouts, keyboard generation with `Ctrl/Command + Enter`, visible focus treatment, live action feedback, reduced-motion handling, and print styling.
- Dedicated `/privacy/` and `/terms/` documents, install manifest, favicon, robots/sitemap, Azure Static Web Apps headers/navigation/caching configuration, MIT license, and full README.
- A product-specific risograph collage system and original hero artwork. Prompt, model, review, and provenance are recorded in `.factory/design.md` and `assets/src/`.

## How to run

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

The required build command is exactly `npm run build`. It produces `dist/index.html`, `dist/privacy/index.html`, and `dist/terms/index.html`.

## Verification

All checks were run locally against the final production build on 2026-08-28.

- `npm test`: passed — 19 unit cases and 13 Playwright browser cases across desktop and 390px mobile Chromium; one duplicate mobile service-worker case is intentionally skipped because the browser-level behavior is covered in desktop Chromium.
- Equation fixture coverage: ten representative formulas, including fraction, square root, powers, sum, integral, limit, Greek variables, inequality, set membership, and matrix reading.
- Playwright axe integration: zero serious or critical violations in both empty and generated states, with the color-contrast rule enabled.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 …`: passed — HTTP 200, title present, `lang="en"`, one `h1`, main landmark present, zero missing image alts, zero unlabeled buttons, and zero console/page errors. Measured load: 565 ms.
- Lighthouse 12.8.2, mobile defaults: Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**.
- Lighthouse timings: FCP **0.9 s**, LCP **1.4 s**, Speed Index **0.9 s**, TBT **0 ms**, CLS **0**, interactive **1.4 s**.
- Transfer size in the Lighthouse run: **59 KiB**. Production main JS: **29.51 KB raw / 10.56 KB gzip**. Main CSS: **17.38 KB raw / 4.80 KB gzip**. No font payload.
- Responsive hero assets: **44 KB** at 720×480 and **104 KB** at 1120×747, both below the 300 KB budget.
- `npm audit`: zero production or development dependency vulnerabilities after upgrades.

## Known limits

- The grammar is deterministic and intentionally finite. Unknown LaTeX commands remain editable and receive a proofing note; the tool does not claim full TeX, MathML, or screen-reader equivalence.
- Markdown is segmented for narration, not rendered as a rich article preview. Raw HTML is treated as text and never executed.
- Table and figure output is a structured placeholder because a meaningful purpose-first description requires the author’s subject knowledge.
- There is no voice synthesis, OCR, equation solving, cloud sync, collaboration, or account system; these are explicit non-goals from the brief.
- The success target of approving ten equations in under 15 minutes and listener comprehension at 80% needs a real teacher/listener study after deployment; automated fixtures cannot establish human comprehension.

## Suggested next steps

1. Run the ten-equation timed study with teachers and record which proofing prompts save or cost time.
2. Add tested narration rules only for unsupported commands observed in real articles.
3. Test exported scripts with multiple screen readers and recording workflows, while keeping the product’s non-equivalence language explicit.
