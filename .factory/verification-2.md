# Turn technical notation into spoken scripts — verification 2

Verified: 2026-09-05  
Work order: `equation-audio-guide-verify-2`  
Live URL: <https://equation-audio-guide.sociobot.in>  
Implementation candidate: `e7eb86259828bb7575e83a7dd3989270c6fa6908`  
Documentation head reviewed: `571322da7251bf1cd2c5ddfd5172ed06fdcfc71b`

## Verdict: FAIL

**FAIL — 2 findings and 5 untested public claims.** A PASS requires zero
findings of every severity and zero untested claims.

The app works end to end in fresh desktop and phone browsers. The build and all
12 declared claim commands pass. The failure is caused by an incomplete claim
inventory and undersized touch targets, not by the main narration flow.

## Cold-page result

Before scrolling in separate fresh browser contexts:

- Job: **Turn technical notation into spoken scripts**.
- Audience: **teachers, learners, and technical writers**.
- First action: **Try it with sample data**.

The action was fully visible at 1440×900 and 390×844. It opened `/demo/` in one
click.

## Findings

### F1 — Medium — Five public claims lack complete declared claim tests

The 12 entries in `.factory/claims.json` each have exactly one matching tagged
test, and every declared command passes. However, the live product and README
make five additional promises that the manifest does not list or whose tagged
test does not prove the full promise:

1. **Copy script** / “Copy ... the script and checklist” is public UI copy, but
   `text-export` tests downloads only.
2. **Exports include each unchecked proofing note** is more specific than the
   `text-export` assertion. Its tagged test checks for a checklist heading, not
   that every unchecked note is present.
3. **Clear removes the saved working copy** appears in the privacy page and
   confirmation dialog, but has no claim entry.
4. **Ctrl/Command + Enter builds a script** appears in the editor and README,
   but has no claim entry. An ordinary browser test covers it, which does not
   meet the required tagged-claim contract.
5. **Close notes that need your subject knowledge** appears in “How it works,”
   but has no claim entry. An ordinary test checks boxes, but there is no
   matching declared claim command.

Fresh live checks found these behaviors working: clipboard copy and the text
export contained the script and all three sample notes;
confirmed Clear removed visible and stored work; the keyboard shortcut built
three segments; and the open-check controls worked. This does not replace the
required manifest entries and exact tagged sandbox assertions.

Repair: list each retained promise in `.factory/claims.json` and add exactly one
outcome-based `@claim:` test for it, or remove the public promise. The export
test must compare all unchecked note text with the downloaded output.

### F2 — Low — Some phone touch targets are smaller than 44×44 CSS pixels

At 390 CSS pixels wide, fresh live measurements found:

- the home wordmark at 134×42;
- footer **Demo** links at 29–34×44;
- footer **Terms** links at 36–42×44; and
- the inline **public repository** link on Terms at 163×18.

Checkboxes render at 20×20 inside 44-pixel-high clickable labels and are not
included in this finding. Axe reports no serious or critical violation, but the
attached accessibility and design contracts explicitly require every touch
target to be at least 44×44 CSS pixels.

Repair: enlarge the anchors' clickable boxes with padding or a 44×44 minimum
size without reducing the current spacing or visible focus treatment.

## Demo and product paths

The live sample opened nine populated review cards: one heading, three prose
segments, two equations, one code block, one table, and one figure. It showed
three open proofing checks and the persistent **Demo — sample data, nothing is
saved** label.

I seeded `equation-audio-guide:v1` with private real data before entering the
demo. Editing and rebuilding wrote only `demo:equation-audio-guide:v1` keys.
**Reset demo** restored the shipped gradient-descent article and nine cards.
**Start for real** removed demo keys and restored the untouched private value.

The following live paths also passed:

- normal generation, approval, revision, restore suggestion, filters, next
  open check, clipboard copy, text export, and confirmed clearing;
- reload persistence for a regular working copy;
- actionable empty-source, unclosed display-math, unclosed MathML, and
  unclosed fenced-code errors, followed by successful keyboard recovery;
- the 60,000-character input boundary and exact counter;
- raw HTML displayed as text without execution; and
- fresh service-worker-controlled offline reload of `/demo/`, with its title,
  sample label, nine cards, and announced offline state intact.

No external request, request body, console error, or page error occurred during
the live sample flow.

## Declared claim commands

All commands below were run separately from a clean checkout of documentation
head `571322d`. Each used the shipped `/demo/` sandbox.

| Claim | Result | Observed proof |
| --- | --- | --- |
| `demo-sandbox` | Pass | Demo edits and reset left seeded real storage unchanged. |
| `supported-input` | Pass | Markdown, LaTeX, MathML, code, table, and figure output was editable. |
| `deterministic-review` | Pass | Repeated input kept its suggestion and showed the ambiguity note. |
| `review-states` | Pass | Approved content changed to Revised after editing. |
| `text-export` | Pass | `.txt` and `.md` files downloaded with expected names and structure. |
| `demo-persistence` | Pass | Demo content survived reload only in the `demo:` namespace. |
| `offline-reload` | Pass | A separate controlled context reloaded the cached demo offline. |
| `local-only` | Pass | Entered text caused only same-origin GET requests without bodies. |
| `no-account` | Pass | The populated sample worked without sign-in controls. |
| `text-not-audio` | Pass | Text downloaded and no audio or video player existed. |
| `no-third-party-runtime` | Pass | The sample and export used only the local test origin. |
| `raw-html-text` | Pass | An `onerror` payload remained text and did not run. |

Evidence: `/work/.evidence/claim-commands.log`. The untested-claim count is
still five because the additional promises in F1 are not declared commands.

## Quality, accessibility, privacy, and performance

- `npm ci`: pass; 97 packages installed, 0 vulnerabilities.
- `npm test`: pass; 19 unit tests and 37 browser tests passed, with the
  intentional duplicate mobile offline test skipped.
- `npm run build`: pass; `dist/index.html` was produced.
- `verify-url.sh`: pass against the emitted local site and live root. Both had
  a title, `lang="en"`, one `h1`, one `main`, image alt text, labelled buttons,
  and no console errors.
- Axe through Playwright: zero serious or critical findings in empty desktop,
  populated desktop, and populated phone states.
- Keyboard: the first Tab reached the skip link with a 3px visible outline;
  activating it made the next Tab bypass the header and reach the sample
  action. Generation moved focus to the review heading. The clear dialog took
  focus and Escape closed it without deleting work.
- Reduced motion: card animation became `0.00001s` and scrolling became `auto`.
- Reflow: the populated demo had no horizontal overflow at 390px or 320px.
- Lighthouse mobile simulation: Performance 98, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.1s, LCP 1.6s, TBT 130ms, CLS 0, 94 KiB transfer.
- Main JS: 31,378 bytes raw / 11.04 KiB gzip. Main CSS: 18,712 bytes raw /
  5.03 KiB gzip. The 720px and 1120px hero files are 41,230 and 105,408 bytes.
- Live responses include HSTS, `nosniff`, Referrer-Policy,
  Permissions-Policy, and a self-only CSP with `frame-ancestors` in the header.
  Hashed JS is immutable; `sw.js` is `no-cache`.

This static product has no backend, tenant, database, or rate-limited API, so
backend isolation, restart persistence, health, and 429 checks do not apply.
The brief does not need a model call: deterministic, author-editable narration
is the stated product job, so no missed AI step was found.

## Routes, links, and deployment identity

Home, Demo, Privacy, Terms, the direct 404 file, the sitemap, robots file,
manifest, artwork, and public source link loaded. Each real route had its own
title, canonical URL, one `h1`, and `main`. An unknown live path returned the
designed page with HTTP 404 and working recovery links; this expected 404 is not
a defect.

Fresh production output matched live byte for byte:

| File | SHA-256 |
| --- | --- |
| `dist/index.html` | `0da4b8558673c60bb2f89426ba1000d4ea91a00f87da32430799f22e5b487aa1` |
| `dist/assets/main-DU_8YzMq.js` | `0516b37375b0f21eee6aa0f691391886bad589ea7feafc5b1cd359a92ff6b6da` |
| `dist/assets/main-DjwTBrw2.css` | `10439f6ffdd4fa76f3c81fb8387c5632512f924bcc87bbd81ca1e8af1e5579bb` |
| `dist/sw.js` | `b2288435abcde0b028c9f5a68e1cf8fc3ddc090bf96804c251fdf6bfc6166260` |

Only `.factory/handoff.md` differs between implementation `e7eb862` and
documentation head `571322d`. Later commits are report-only.

## Earlier finding disposition

| Earlier item | Current disposition |
| --- | --- |
| Review 1 F1: no demo sandbox | Fixed. Direct demo, separate keys, banner, reset, and start-real passed live. |
| Review 1 F2: no claim contract | The 12 added claims pass, but coverage is still incomplete for five public promises; see F1. |
| Review 1 F3: mobile contrast | Fixed. Populated phone axe scan has zero serious/critical findings. |
| Review 1 F4: unreliable offline test | Fixed. The full suite and isolated command pass with the emitted-site server. |
| Review 1 F5: missing designed 404 | Fixed. Unknown live paths return the designed page with HTTP 404. |
| Review 1 F6: route metadata | Fixed. Titles, canonicals, social metadata, icons, and sitemap entries are present. |
| Review 1 F7: first-screen and copy audit | Fixed. Job, audience, first action, facts, and copy audit meet the stated format. |
| Verification 1 local-preview offline caveat | Fixed by the production-style static test server; local and live offline tests pass. |
| Verification 1 deployment identity | Confirmed again against implementation `e7eb862` with byte comparisons. |

## Evidence files

The external evidence bundle is in `/work/.evidence/` and includes the clean
install, full test, individual claim, build, live-browser, header, hash,
Lighthouse, reflow, and screenshot evidence. The repository report is this
file; no product code was changed.
