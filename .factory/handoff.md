# Equation Audio Guide — repair handoff

Completed: 2026-09-05  
Work order: `equation-audio-guide-repair-1`  
Live: <https://equation-audio-guide.sociobot.in>

## Result

**PASS.** The release blockers from review 1 are repaired. The deployed
implementation is `e7eb86259828bb7575e83a7dd3989270c6fa6908`; its main product
and test change is `71043743e33d4b4882080a9999cbf6998db6c4c5`, followed by the
deployed 404-routing correction in `e7eb862`. The initial documentation record
is `fe3a0a21c8119c345e114ac6e793e510cbcaa1e7` and does not change deployed
product files.

## What changed

- Added a real `/demo/` entry point and one-click landing action. The demo loads
  a gradient-descent article into nine populated review cards.
- Isolated demo state in `demo:equation-audio-guide:v1` local-storage keys.
  The persistent banner has **Reset demo** and **Start for real**. Demo tests
  seed real storage and prove it remains unchanged.
- Added `.factory/claims.json` with twelve visitor claims. Each has exactly one
  outcome-based `@claim:` Playwright test that begins with the shipped demo.
- Replaced the flaky Vite-preview service-worker host with
  `tests/static-server.mjs`, a production-style server for the emitted `dist/`
  tree. The fresh-context offline test now reloads the cached demo reliably.
- Removed opacity from generated-card motion so readable controls retain full
  contrast throughout entrance motion. Desktop and mobile axe scans now have no
  serious or critical violations.
- Added a static demo page, a designed `404.html`, route-specific titles,
  canonical URLs, Open Graph and Twitter metadata, a 1200×630 social image,
  and a 180px touch icon. Unknown live paths now return the designed page with
  HTTP 404.
- Rewrote landing and legal copy in plain words, named the audience and first
  action, and added the copy audit, demo documentation, catalog description,
  and updated README.

## Review 1 disposition

| Finding | Disposition |
| --- | --- |
| F1 demo sandbox | Fixed: direct demo, sample label, reset/start-real controls, isolated `demo:` keys, and `.factory/demo.md`. |
| F2 claims | Fixed: twelve manifest entries and exact tagged clean-demo tests. |
| F3 mobile contrast | Fixed: no opacity compositing during card entry; mobile axe passes. |
| F4 offline test | Fixed: emitted-site static test server and separate fresh browser context. |
| F5 404 | Fixed: designed page, SWA response override, and live unknown path returns HTTP 404. |
| F6 metadata and sitemap | Fixed: demo metadata/title, canonical, OG/Twitter, touch icon, social image, and sitemap route. |
| F7 plain words | Fixed: audience and sample action are on the first screen; audit is in `.factory/copy-audit.md`. |

## Run and verify

```sh
npm ci
npm test
npm run build
```

Final clean-suite result: **19 unit tests passed; 37 browser tests passed; one
mobile duplicate offline test skipped intentionally.** The browser suite checks
normal, invalid, recovery, raw-HTML safety, boundary, review, exports, desktop,
390px mobile, keyboard, focus, reduced motion, legal routes, metadata, 404,
privacy requests, demo isolation, and offline reload.

All twelve claim commands in `.factory/claims.json` were also run individually
from the clean setup and passed. `npm run build` produces `dist/` with
`index.html`, `demo/index.html`, legal pages, and `404.html`.

Additional checks:

- Axe through Playwright found zero serious or critical issues in empty and
  populated desktop and mobile states.
- `verify-url.sh` passed against the local emitted site and live HTTPS root:
  title, `lang`, one `h1`, `main`, image alt text, button names, and root/demo
  console checks are clean.
- Live fresh desktop and phone contexts showed: job **Turn technical notation
  into spoken scripts**; audience **teachers, learners, and technical
  writers**; first action **Try it with sample data**. The demo showed nine
  cards, its persistent label, and a successful reset. Phone width had no
  horizontal overflow.
- Live request capture during the demo observed only
  `https://equation-audio-guide.sociobot.in`. A controlled service worker
  reloaded `/demo/` offline with the demo banner, offline status, and nine
  cards intact.
- Live `/privacy/` and `/terms/` return their own titles and main landmarks.
  Live `/missing-page` returns HTTP 404 and the designed recovery page.
- Live headers include HSTS, `nosniff`, Referrer-Policy, Permissions-Policy,
  CSP with response-header `frame-ancestors`, and the required self-only
  script/style/connect policy.
- Lighthouse output for the emitted site: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; FCP 1.1s, LCP 1.6s, TBT 60ms, CLS 0, transfer
  94 KiB. The Lighthouse process reported a post-audit tab crash after writing
  this complete JSON report, so the category data is recorded accurately rather
  than treating that wrapper exit as a product failure.

## Known limits and next steps

- Narration rules are deterministic and finite. Unknown LaTeX stays editable
  and receives a review prompt. The tool does not claim full TeX, MathML, or
  screen-reader equivalence.
- It does not provide voice generation, OCR, equation solving, accounts, cloud
  sync, or collaboration.
- The brief’s teacher time target and listener-comprehension target require a
  real study. Automated tests cannot establish those human outcomes.
- Next: run the ten-equation teacher study, gather unsupported notation from
  real articles, then add only tested narration rules that address it.
