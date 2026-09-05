# Equation Audio Guide review 1 — turn technical articles into editable narration scripts

Reviewed: 2026-09-05  
Work order: `equation-audio-guide-review-1`  
Live URL: <https://equation-audio-guide.sociobot.in/>  
Implementation candidate: `d74e66aef8a5ff172d4aa5daddb24b158dcc7855`  
Documentation HEAD: `6852b6584a64dbdb58f79906ca425a9cb8b695ba`

## Verdict: FAIL

**FAIL — 7 findings, including 4 high-severity findings, and 11 untested public claims.** A PASS requires zero findings and zero untested claims.

The live JS, CSS, and service-worker SHA-256 values exactly match the production build from this checkout (`main-DhIwdBUN.js`, `main-D2qsCpsU.css`, and `sw.js`). The deployed product is therefore the implementation candidate; the later `6852b65` commit is documentation-only.

## What I checked

I opened new, isolated Chromium contexts against the live site at desktop (1440 × 900) and phone (Pixel-style 393 × 727 / 390 × 844) sizes before scrolling.

- Job visible on first screen: turn Markdown, LaTeX, code, tables, and figures into an editable narration script.
- Audience visible on first screen: **not named**. The README names teachers, learners, and technical writers, but the first screen does not.
- First action visible on first screen: **“Draft the audio guide”**, which only moves to the editor. It is not the required one-click sample action.
- Both initial loads were HTTP 200 with the expected title, one `h1`, no browser console errors, and no horizontal overflow at 390px.
- The live `Load example` then `Build the spoken route` path produced 9 realistic populated cards: heading, prose, equation, code, table, and figure material, with 3 open proofing checks. It is usable output, but not demo output.
- Normal route, invalid fenced-code input, recovery with valid math, and the 60,000-character boundary worked. The invalid message was specific and recovery produced two cards. Raw article HTML remains text in the shipped implementation tests.
- The live app passed a fresh offline reload after service-worker control; the offline status appeared and no console errors occurred. Keyboard Tab reached the skip link with a `3px` tomato focus outline. Reduced motion changed scrolling to `auto` and animation duration to `0.01ms`.
- Live request capture during the sample flow observed only `https://equation-audio-guide.sociobot.in`. This is useful independent evidence, but it does not replace required claim tests.
- Internal linked routes and the public source link returned HTTP 200. Privacy and Terms have their required titles and `main` landmarks.

## Findings

### F1 — High — The required demo sandbox does not exist

There is no **“Try it with sample data”** action on the first screen. `/demo` and `/demo/` return the ordinary landing/editor UI, with the root title and no demo state. After `Load example` and build, the live browser writes `equation-audio-guide:v1`, the real working-storage namespace. There is no persistent “Demo — sample data, nothing is saved” label, no **Reset demo**, no **Start for real**, no `demo:` namespace, and no `.factory/demo.md`.

This fails the one-click, isolated, resettable demo contract and means a visitor cannot safely distinguish sample work from real work. The browser context used for this review was fresh and isolated; no real visitor data was accessed.

Repair: add a direct `/demo` (or `?demo=1`) flow with a first-screen sample action, persistent demo label, reset/start-real controls, a separate `demo:` storage namespace, and demo documentation. Test that demo never reads or writes real keys.

### F2 — High — The claim contract is absent; 11 public claims are untested

`.factory/claims.json` is missing, so no public claim has the required exactly-one `@claim:<id>` command. I found 11 distinct public, testable claims that consequently have no declared sandbox proof: supported input and editable narration; deterministic suggestions and ambiguity flags; editable review states; text/Markdown exports; local working-copy persistence; offline use after caching; local-only/no upload; no account; no synthetic voice; no third-party runtime tracking/assets; and raw article HTML not executing.

Ordinary unit and browser tests cover parts of several of these, but the claims contract requires a manifest and a clean-demo command per claim. There were therefore no declared claim commands to run, and the untested-claim count is **11**.

Repair: create `.factory/claims.json`, remove any claim that cannot be proven, and add one tagged clean-demo test for each retained claim. Include the complete request log for privacy claims and a separate fresh-context offline-reload test.

### F3 — High — `npm test` fails the required quality gate because generated mobile cards expose serious contrast failures

From the documented clean setup (`npm ci`), `npm test -- --reporter=list` ended **2 failed, 11 passed, 1 skipped**. The reproducible focused run `npx playwright test --project=mobile --grep 'no serious accessibility' --reporter=list` fails.

The generated mobile state reports an axe serious `color-contrast` violation. During card entry, white approve-button text is measured at **4.11:1** on `#358984`, and white proofing-note legends are measured at **3.63:1** on `#d36457`; both are below the required 4.5:1. This is a real required accessibility/quality-gate failure even though a later, settled live scan did not flag it.

Repair: make entered content meet contrast throughout its animation (or avoid opacity-based entrance for readable controls), then keep color-contrast enabled and make the mobile axe test pass.

### F4 — High — The documented test suite has an unreliable service-worker test

The same clean `npm test` run timed out after 30 seconds in `serves the cached shell offline and shows its status`, waiting for `navigator.serviceWorker.controller`. The focused Chromium run can pass, and a fresh live service-worker-controlled offline reload passed. That proves the deployed user path can work, but it does not make the required local quality gate pass.

This is the minor local-preview caveat in the prior verification report, now still unresolved as a failing declared test rather than merely an environment note.

Repair: make the test wait for activation/control reliably in the preview environment, or test the emitted build with a production-like static server. Do not mask the timeout or weaken the offline assertion.

### F5 — Medium — `/404` is the normal application, not a designed 404 response

`/404` and `/404.html` both return HTTP 200 and render the ordinary landing page with the normal home `h1`; no 404 explanation or back link is present. `staticwebapp.config.json` has only a navigation fallback and no 404 response override.

Repair: ship a styled `404.html` with an explicit not-found heading and home link, configure the Static Web Apps 404 rewrite, and add it to route verification.

### F6 — Medium — Required route metadata and sitemap coverage are incomplete

The landing document has title, description, language, theme color, favicon, and manifest, but it has no canonical link, Open Graph metadata, Twitter card metadata, or 180px apple-touch icon. `/demo` keeps the root title instead of `Demo — Equation Audio Guide`; the sitemap omits the required demo route.

Repair: add the missing metadata and product-derived social image, set a distinct demo title when demo is implemented, and list all real routes in the sitemap.

### F7 — Low — First-screen wording and audit evidence do not meet the plain-words contract

The first screen does not name the intended teachers, learners, or technical writers; its action is not the sample path; and it uses mood/metaphor labels such as “Author’s working copy,” “The working table,” “Audio margin,” and “A compact editorial pass.” `.factory/copy-audit.md` is also missing, so no sentence-word-count/banned-word/terminology audit was supplied.

Repair: use direct section names and name the audience in the one-sentence first-screen description. Add the required copy audit after revising the copy.

## Quality-gate and contract evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Clean prerequisite install | Pass | `npm ci`: 98 packages audited, 0 vulnerabilities. |
| Declared test command | **Fail** | 19 Vitest tests passed; Playwright result: 2 failed, 11 passed, 1 skipped. Findings F3 and F4. |
| Production build | Pass | `npm run build` passed and generated `dist/` with root `index.html`. |
| Basic deployed accessibility | Pass | `verify-url.sh` on local production build: title/lang/one h1/main/alt/buttons/console all clean; live desktop and settled phone axe scans had no serious/critical issues. |
| Generated mobile accessibility | **Fail** | Focused mobile axe test reproduces serious contrast violations; see F3. |
| Privacy/network smoke check | Partial | Sample flow made same-origin requests only and local content was cleared, but F1/F2 mean no isolated demo or claim proof. |
| Offline promise | Pass on live | Fresh service-worker control, offline reload, status banner, and title/main all worked. Local declared test still fails; see F4. |
| Links/legal | Partial | Home, Privacy, Terms, robots, sitemap, manifest, and Source link returned 200; 404 behavior fails F5. |

## Prior verification disposition

The only earlier independent verification is `.factory/verification.md` (2026-08-28), which reported PASS for `d74e66a` and recorded one low local Vite-preview offline-navigation caveat. There is no earlier `review-*.md`.

| Earlier item | Current disposition |
| --- | --- |
| Candidate/deployment identity | Confirmed. Current live JS, CSS, and `sw.js` SHA-256 values match this checkout’s build exactly. |
| Live offline reload | Confirmed. It passed again in a fresh controlled live browser. |
| Earlier local-preview offline caveat | **Not resolved.** The current full declared suite times out waiting for service-worker control (F4), although a focused run and the live flow can pass. |
| Earlier asserted zero serious/critical axe issues | **Superseded.** The current exact mobile generated-state axe test reproducibly reports serious contrast issues (F3). |
| Earlier no-defect verdict | Superseded by this review’s current findings F1–F7. |

## Required next steps

1. Implement and test the isolated one-click demo before touching real local data.
2. Add the claims manifest and one clean-demo test per public claim.
3. Fix mobile contrast throughout the card entrance and make all declared tests pass reliably.
4. Add a real 404, complete metadata/sitemap, and plain-words/copy-audit evidence.

