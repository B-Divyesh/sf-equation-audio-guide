# Independent verification — PASS

Verified: 2026-08-28  
Candidate commit: `d74e66aef8a5ff172d4aa5daddb24b158dcc7855`  
Live URL: <https://equation-audio-guide.sociobot.in/>  
Verifier work order: `equation-audio-guide-verify-1`

## Verdict

**PASS.** The live static web app is the requested candidate build and met the researched brief's smallest useful product contract in independent local and deployed-browser checks. No release-blocking defect was found.

## Reproducible local gates

- Clean checkout was already at the candidate SHA with no working-tree changes.
- `npm ci` completed: 98 packages audited, 0 vulnerabilities.
- `npm test` passed: 19 Vitest unit tests and 13 Playwright tests across desktop Chromium and the 390px mobile profile; one intentionally duplicate mobile service-worker case was skipped. The complete suite took 44.1 seconds.
- Exact production command `npm run build` passed (`tsc --noEmit && vite build`) and created `dist/`.
- No separate lint script exists in `package.json`; TypeScript checking is part of the required build.

## Product and recovery checks

Against the production build served by `npm run preview -- --port 4174`:

- A mixed representative article generated 14 ordered review cards for a heading, ten representative equations, fenced code, a Markdown table, and a figure.
- All ten required equation readings appeared in editable narration: fraction, square root, squared, sum, integral, limit, Greek letters, inequality, set membership, and a 2-row matrix.
- The normal keyboard route works with `Ctrl+Enter`; exports produced `equation-audio-guide.txt` containing the edited narration and review checklist.
- A segment changed from **Approved** to **Revised** after narration editing; reload retained the local working copy; the confirmation dialog cleared source and cards.
- Empty source, an unclosed code fence, unclosed display math, and unclosed MathML produced specific inline alert messages and recovered after valid source was supplied.
- The declared 60,000-character boundary was accepted and displayed as `60,000 / 60,000`.
- Raw `<img onerror>` source remained literal source text and did not execute (`window.__qaUnsafe` stayed `null`).

## Accessibility, responsive, motion, and browser quality

- Local desktop production page: HTTP 200, title present, `lang="en"`, exactly one `h1`, and one `main` landmark.
- Independent axe scans of empty and generated states found **0 serious/critical** violations. The live mobile scan likewise found **0 serious/critical** findings.
- A keyboard Tab stop showed the designed `rgb(200, 61, 47) solid 3px` focus outline.
- At 390px, live `scrollWidth` equalled `clientWidth` (390px): no horizontal overflow. Existing Playwright coverage also exercised 390px layout and legal-page landmarks.
- `prefers-reduced-motion: reduce` changed scroll behavior to `auto` and reduced animation duration to `0.01ms`.
- No console errors or page errors occurred during the independent normal, invalid-input, or live-load paths.

## Privacy, network, security, and performance

- Browser request capture from both local production build and live site found no external runtime requests, analytics, remote fonts, or remote scripts. The site stores author content locally only.
- Live responses were 200 and supplied CSP `default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive Permissions Policy, and HSTS.
- Live `/assets/main-DhIwdBUN.js` had `Cache-Control: public, max-age=31536000, immutable`; live `/sw.js` had `Cache-Control: no-cache`.
- Main JS is 29,507 bytes raw / 10.56 KB gzip, main CSS 17,376 bytes raw / 4.80 KB gzip, no font payload. The responsive hero is 41,230 bytes (720w) or 105,408 bytes (1120w). All are within the stated budgets.
- Lighthouse 13.4.1 mobile simulated run on the local production build reported Performance 97, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0s, LCP 1.4s, TBT 180ms, CLS 0, transfer 59 KiB. Lighthouse exited non-zero after writing this otherwise complete report because its Chrome target crashed during post-audit screenshot/BFCache collection; the published category and metric values were present in the generated JSON and are corroborated by the browser checks above.

## Deployment identity and PWA

- The live home page referenced exactly `/assets/main-D2qsCpsU.css` and `/assets/main-DhIwdBUN.js`, identical to local `dist/index.html`; its JavaScript content length was 29,507 bytes.
- Live `sw.js` compared byte-for-byte equal to `dist/sw.js` (`cmp` exit 0). This is fresh evidence that the deployment is the candidate, rather than an earlier build.
- On the live deployment, after service-worker control, an actual offline `page.reload()` retained one `main`, the correct title, and displayed the offline banner. This tests navigation, not merely `fetch('/')`.
- Service-worker upgrade behavior was tested by unregistering, seeding the obsolete `equation-audio-guide-v1` cache, then re-registering: only `equation-audio-guide-v2` remained and controlled the client.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low / environment note: Vite's local `preview` server produced `net::ERR_FAILED` and no rendered `main` for an offline navigation reload even though the emitted service worker and caches were complete. The exact same `dist/sw.js` and assets pass the actual offline reload on the Azure deployment, so this is not a deployed-product defect. Future local PWA checks should use a production-like static host when possible.

