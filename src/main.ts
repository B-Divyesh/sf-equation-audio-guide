import './styles.css';
import { parseArticle } from './narration';
import type { GuideSegment, ReviewStatus, SavedGuide } from './types';

const REAL_STORAGE_KEY = 'equation-audio-guide:v1';
const DEMO_STORAGE_KEY = 'demo:equation-audio-guide:v1';
const DEMO_SESSION_KEY = 'equation-audio-guide:demo-route';
const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
const directDemo = currentPath === '/demo' || new URLSearchParams(window.location.search).get('demo') === '1';
let isDemo = directDemo;
try {
  if (directDemo) sessionStorage.setItem(DEMO_SESSION_KEY, '1');
  else if (sessionStorage.getItem(DEMO_SESSION_KEY) === '1') isDemo = true;
} catch { /* Session storage may be disabled. */ }
const storageKey = isDemo ? DEMO_STORAGE_KEY : REAL_STORAGE_KEY;
const draftKey = `${storageKey}:draft`;
const example = `# How gradient descent moves

We update the parameter by stepping against the slope of the loss.

$$
\\theta_{t+1} = \\theta_t - \\eta \\frac{\\partial L}{\\partial \\theta_t}
$$

The learning rate $\\eta$ controls the size of that step.

\`\`\`python
for step in range(steps):
    theta = theta - rate * gradient(theta)
\`\`\`

| Symbol | Meaning |
| --- | --- |
| $\\theta$ | parameter |
| $\\eta$ | learning rate |

![A loss curve descending toward its minimum](loss-curve.png)`;

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Application root is missing.');

app.innerHTML = `
  <header class="site-header">
    <a class="wordmark" href="/" aria-label="Equation Audio Guide home">
      <span class="wordmark-mark" aria-hidden="true">∿</span>
      <span>Equation<br>Audio Guide</span>
    </a>
    <nav aria-label="Primary navigation">
      <a href="/demo/">Try the demo</a>
      <a href="#how">How it works</a>
      <a href="/privacy/">Privacy</a>
    </nav>
    <span class="local-note"><span aria-hidden="true">●</span> Browser only</span>
  </header>

  <aside class="demo-banner" id="demo-banner" role="status" aria-label="Demo status" ${isDemo ? '' : 'hidden'}>
    <p><strong>Demo — sample data, nothing is saved</strong></p>
    <div>
      <button class="demo-reset" id="reset-demo" type="button">Reset demo</button>
      <a class="demo-start-real" id="start-real" href="/">Start for real</a>
    </div>
  </aside>

  <div class="network-banner" id="network-banner" role="status" hidden>
    You’re offline. The guide still works here. Exports stay in this browser.
  </div>

  <main id="main">
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy">
        <p class="eyebrow"><span>Technical narration editor</span> <span>01</span></p>
        <h1 id="page-title">Turn technical notation into spoken scripts</h1>
        <p class="lede">For teachers, learners, and technical writers who need an editable way to explain equations and code aloud.</p>
        <div class="hero-actions">
          <a class="button button-primary hero-action" href="/demo/">Try it with sample data <span aria-hidden="true">→</span></a>
          <a class="text-link" href="#workspace">Or paste your article below</a>
        </div>
        <p class="action-note">The demo opens a filled technical article and its reviewable script.</p>
        <ul class="trust-line" aria-label="Product facts"><li>No account</li><li>Article text stays in your browser</li><li>Creates a script, not audio</li></ul>
      </div>
      <figure class="hero-art">
        <div class="tape tape-top" aria-hidden="true"></div>
        <picture>
          <img src="/assets/audio-margin-hero-1120.webp" srcset="/assets/audio-margin-hero-720.webp 720w, /assets/audio-margin-hero-1120.webp 1120w" sizes="(max-width: 960px) calc(100vw - 40px), 48vw" width="1536" height="1024" fetchpriority="high" decoding="async" alt="Risograph collage of a notation sheet passing through a folded paper horn and emerging as three checked narration strips.">
        </picture>
        <figcaption><span>Source notation</span><span>Editable script</span></figcaption>
      </figure>
    </section>

    <section class="workspace" id="workspace" aria-labelledby="workspace-title">
      <div class="section-rule" aria-hidden="true"><span>✣</span></div>
      <div class="workspace-heading">
        <div>
          <p class="kicker">Create a guide</p>
          <h2 id="workspace-title">Paste your article and review the script</h2>
        </div>
        <p>Suggestions are not universal screen-reader output. Check the wording before you publish.</p>
      </div>

      <div class="workbench">
        <section class="source-pane" aria-labelledby="source-title">
          <div class="pane-heading">
            <div>
              <span class="step-number">1</span>
              <div><p class="kicker">Article source</p><h3 id="source-title">Paste your article</h3></div>
            </div>
            <button class="text-button" id="load-example" type="button">Try the sample</button>
          </div>
          <label for="source-input">Markdown, LaTeX, MathML, or code</label>
          <textarea id="source-input" spellcheck="false" maxlength="60000" placeholder="Paste a section here…&#10;&#10;Try: The area is $A = \\pi r^2$." aria-describedby="source-help source-count"></textarea>
          <div class="input-meta">
            <p id="source-help">Supports <code>$…$</code>, <code>$$…$$</code>, <code>\\[…\\]</code>, <code>&lt;math&gt;</code>, fenced code, Markdown tables, and images.</p>
            <span id="source-count">0 / 60,000</span>
          </div>
          <p class="form-error" id="source-error" role="alert" hidden></p>
          <div class="source-actions">
            <button class="button button-primary" id="generate" type="button">Build the spoken route <span aria-hidden="true">→</span></button>
            <button class="button button-quiet" id="clear" type="button">Clear</button>
          </div>
          <p class="shortcut">Keyboard: <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> to build</p>
        </section>

        <section class="review-pane" aria-labelledby="review-title">
          <div class="pane-heading review-heading">
            <div>
              <span class="step-number step-number-red">2</span>
              <div><p class="kicker">Script review</p><h3 id="review-title" tabindex="-1">Review the script</h3></div>
            </div>
            <div class="progress-stamp" id="progress-stamp" aria-live="polite"><strong>0/0</strong><span>approved</span></div>
          </div>
          <div id="review-empty" class="review-empty">
            <span class="empty-glyph" aria-hidden="true">$ → ”</span>
            <h4>Your script will appear here.</h4>
            <p>Paste a section and build the guide. You can edit every suggestion before publishing.</p>
          </div>
          <div id="review-content" hidden>
            <div class="review-toolbar" aria-label="Review controls">
              <div class="filter-group" role="group" aria-label="Filter segments">
                <button type="button" class="filter-button is-active" data-filter="all" aria-pressed="true">All <span id="count-all">0</span></button>
                <button type="button" class="filter-button" data-filter="issues" aria-pressed="false">Open checks <span id="count-issues">0</span></button>
                <button type="button" class="filter-button" data-filter="approved" aria-pressed="false">Approved <span id="count-approved">0</span></button>
              </div>
              <button type="button" class="next-issue" id="next-issue">Next open check <span aria-hidden="true">↓</span></button>
            </div>
            <ol class="segment-list" id="segment-list"></ol>
            <div class="export-desk" id="export-desk">
              <div>
                <p class="kicker">Export the script</p>
                <h4>Download the reviewed script</h4>
                <p>Exports include each unchecked proofing note.</p>
              </div>
              <div class="export-actions">
                <button class="button button-primary" id="copy-script" type="button">Copy script</button>
                <button class="button button-quiet" id="export-text" type="button">Export .txt</button>
                <button class="button button-quiet" id="export-markdown" type="button">Export .md</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>

    <section class="how" id="how" aria-labelledby="how-title">
      <p class="kicker">How it works</p>
      <h2 id="how-title">Create a spoken script in three steps</h2>
      <ol>
        <li><span>01</span><h3>Add article source</h3><p>Paste prose, equations, code, tables, and figures. Raw article HTML stays as text.</p></li>
        <li><span>02</span><h3>Review suggestions</h3><p>Edit each spoken phrase. Close notes that need your subject knowledge.</p></li>
        <li><span>03</span><h3>Export the script</h3><p>Copy or download the script and checklist as plain text or Markdown.</p></li>
      </ol>
    </section>
  </main>

  <footer>
    <div class="footer-mark" aria-hidden="true">∿</div>
    <p><strong>Equation Audio Guide</strong><br>Editable narration scripts for technical articles.</p>
    <nav aria-label="Footer navigation"><a href="/demo/">Demo</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-equation-audio-guide">Source</a></nav>
    <p class="art-note">Original AI-generated collage. No third-party assets or tracking. Built by Param Factory · v1.1.0.</p>
  </footer>

  <dialog id="clear-dialog" aria-labelledby="clear-title">
    <form method="dialog">
      <span class="dialog-mark" aria-hidden="true">×</span>
      <h2 id="clear-title">Clear this working copy?</h2>
      <p>This removes the pasted article and its review notes from this browser. Export first if you need a copy.</p>
      <div class="dialog-actions">
        <button class="button button-quiet" value="cancel">Keep my guide</button>
        <button class="button button-danger" id="confirm-clear" value="clear">Clear guide</button>
      </div>
    </form>
  </dialog>
  <div class="toast" id="toast" role="status" aria-live="polite" aria-atomic="true"></div>
`;

const sourceInput = document.querySelector<HTMLTextAreaElement>('#source-input')!;
const sourceCount = document.querySelector<HTMLElement>('#source-count')!;
const sourceError = document.querySelector<HTMLElement>('#source-error')!;
const reviewEmpty = document.querySelector<HTMLElement>('#review-empty')!;
const reviewContent = document.querySelector<HTMLElement>('#review-content')!;
const segmentList = document.querySelector<HTMLOListElement>('#segment-list')!;
const progressStamp = document.querySelector<HTMLElement>('#progress-stamp')!;
const toast = document.querySelector<HTMLElement>('#toast')!;
const clearDialog = document.querySelector<HTMLDialogElement>('#clear-dialog')!;
let segments: GuideSegment[] = [];
let currentFilter: 'all' | 'issues' | 'approved' = 'all';
let toastTimer = 0;

document.querySelector<HTMLAnchorElement>('.wordmark[href="/"]')?.addEventListener('click', () => {
  try { sessionStorage.removeItem(DEMO_SESSION_KEY); } catch { /* Session storage may be disabled. */ }
});

function configureRouteMetadata(): void {
  const title = isDemo ? 'Demo — Equation Audio Guide' : 'Equation Audio Guide — editable technical narration';
  document.title = title;
  const routeUrl = `https://equation-audio-guide.sociobot.in${isDemo ? '/demo' : '/'}`;
  document.querySelector<HTMLLinkElement>('#canonical-link')?.setAttribute('href', routeUrl);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', routeUrl);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title);
}

function showToast(message: string): void {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function validateSource(value: string): string {
  if (!value.trim()) return 'Paste or type a technical section first.';
  if ((value.match(/^\s*```/gm)?.length ?? 0) % 2 !== 0) return 'A fenced code block is not closed. Add the final ``` and build again.';
  const mathFenceCount = value.match(/\$\$/g)?.length ?? 0;
  if (mathFenceCount % 2 !== 0) return 'A display equation is not closed. Add the final $$ and build again.';
  if (/<math(?:\s|>)/i.test(value) && !/<\/math>/i.test(value)) return 'The MathML block is not closed. Add </math> and build again.';
  return '';
}

function updateCount(): void {
  sourceCount.textContent = `${sourceInput.value.length.toLocaleString()} / 60,000`;
}

function saveGuide(): void {
  try {
    const guide: SavedGuide = { source: sourceInput.value, segments, savedAt: Date.now() };
    localStorage.setItem(storageKey, JSON.stringify(guide));
  } catch {
    showToast('This browser could not save locally. Export a copy before leaving.');
  }
}

function restoreGuide(): void {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const saved = JSON.parse(raw) as SavedGuide;
    if (typeof saved.source !== 'string' || !Array.isArray(saved.segments)) return;
    sourceInput.value = saved.source;
    segments = saved.segments;
    updateCount();
    if (segments.length) renderSegments();
  } catch {
    localStorage.removeItem(storageKey);
  }
}

function statusLabel(status: ReviewStatus): string {
  return { 'needs-review': 'Needs review', approved: 'Approved', revised: 'Revised' }[status];
}

function segmentHasOpenIssues(segment: GuideSegment): boolean {
  return segment.issues.some((issue) => !issue.checked);
}

function visibleSegment(segment: GuideSegment): boolean {
  if (currentFilter === 'issues') return segmentHasOpenIssues(segment);
  if (currentFilter === 'approved') return segment.status === 'approved';
  return true;
}

function makeButton(label: string, className: string, action: string, segmentId: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.dataset.action = action;
  button.dataset.segment = segmentId;
  button.textContent = label;
  return button;
}

function renderCard(segment: GuideSegment, index: number): HTMLLIElement {
  const item = document.createElement('li');
  item.className = `segment-card status-${segment.status}`;
  item.id = segment.id;
  item.dataset.hasIssues = String(segmentHasOpenIssues(segment));
  item.hidden = !visibleSegment(segment);

  const header = document.createElement('div');
  header.className = 'segment-header';
  const identity = document.createElement('div');
  identity.className = 'segment-identity';
  const number = document.createElement('span');
  number.className = 'segment-number';
  number.textContent = String(index + 1).padStart(2, '0');
  const title = document.createElement('h4');
  title.textContent = segment.label;
  identity.append(number, title);
  const stamp = document.createElement('span');
  stamp.className = 'status-stamp';
  stamp.textContent = statusLabel(segment.status);
  header.append(identity, stamp);

  const sourceLabel = document.createElement('p');
  sourceLabel.className = 'field-label';
  sourceLabel.textContent = 'From the article';
  const source = document.createElement('pre');
  source.className = 'source-excerpt';
  source.textContent = segment.source;

  const narrationLabel = document.createElement('label');
  narrationLabel.className = 'field-label';
  narrationLabel.htmlFor = `${segment.id}-narration`;
  narrationLabel.textContent = 'Spoken route — edit freely';
  const narration = document.createElement('textarea');
  narration.className = 'narration-input';
  narration.id = `${segment.id}-narration`;
  narration.dataset.segment = segment.id;
  narration.value = segment.narration;
  narration.rows = Math.max(3, Math.min(8, Math.ceil(segment.narration.length / 70)));

  item.append(header, sourceLabel, source, narrationLabel, narration);

  if (segment.issues.length) {
    const proof = document.createElement('fieldset');
    proof.className = 'proofing-notes';
    const legend = document.createElement('legend');
    legend.textContent = `${segment.issues.length} proofing ${segment.issues.length === 1 ? 'note' : 'notes'}`;
    proof.append(legend);
    for (const issue of segment.issues) {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = issue.checked;
      checkbox.dataset.segment = segment.id;
      checkbox.dataset.issue = issue.id;
      const text = document.createElement('span');
      text.textContent = issue.text;
      label.append(checkbox, text);
      proof.append(label);
    }
    item.append(proof);
  }

  const actions = document.createElement('div');
  actions.className = 'segment-actions';
  actions.append(
    makeButton(segment.status === 'approved' ? 'Approved ✓' : 'Approve segment', 'approve-button', 'approve', segment.id),
    makeButton('Restore suggestion', 'restore-button', 'restore', segment.id),
  );
  item.append(actions);
  return item;
}

function updateSummary(): void {
  const approved = segments.filter((segment) => segment.status === 'approved').length;
  const openIssues = segments.reduce((total, segment) => total + segment.issues.filter((issue) => !issue.checked).length, 0);
  progressStamp.innerHTML = `<strong>${approved}/${segments.length}</strong><span>approved</span>`;
  document.querySelector('#count-all')!.textContent = String(segments.length);
  document.querySelector('#count-issues')!.textContent = String(openIssues);
  document.querySelector('#count-approved')!.textContent = String(approved);
}

function renderSegments(save = true): void {
  reviewEmpty.hidden = segments.length > 0;
  reviewContent.hidden = segments.length === 0;
  segmentList.replaceChildren(...segments.map(renderCard));
  updateSummary();
  if (save) saveGuide();
}

function selectAllSegmentsFilter(): void {
  currentFilter = 'all';
  document.querySelectorAll<HTMLButtonElement>('.filter-button').forEach((button) => {
    const active = button.dataset.filter === 'all';
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function loadDemoSample(focusSource = false): void {
  sourceInput.value = example;
  sourceError.hidden = true;
  sourceInput.removeAttribute('aria-invalid');
  updateCount();
  segments = parseArticle(example);
  selectAllSegmentsFilter();
  renderSegments();
  if (focusSource) sourceInput.focus();
  showToast('Sample technical article loaded.');
}

function buildGuide(): void {
  const error = validateSource(sourceInput.value);
  sourceError.hidden = !error;
  sourceError.textContent = error;
  sourceInput.setAttribute('aria-invalid', String(Boolean(error)));
  if (error) { sourceInput.focus(); return; }
  try {
    segments = parseArticle(sourceInput.value);
    selectAllSegmentsFilter();
    renderSegments();
    showToast(`Built ${segments.length} route ${segments.length === 1 ? 'segment' : 'segments'}.`);
    document.querySelector<HTMLElement>('#review-title')?.focus({ preventScroll: true });
    reviewContent.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  } catch {
    sourceError.hidden = false;
    sourceError.textContent = 'That source could not be parsed. Remove malformed MathML or unmatched notation and try again.';
  }
}

function getSegment(id: string | undefined): GuideSegment | undefined {
  return segments.find((segment) => segment.id === id);
}

function approveSegment(segment: GuideSegment, card: HTMLElement): void {
  const openIssue = segment.issues.find((issue) => !issue.checked);
  if (openIssue) {
    showToast('Close each proofing note before approval.');
    card.querySelector<HTMLInputElement>(`input[data-issue="${openIssue.id}"]`)?.focus();
    return;
  }
  segment.status = 'approved';
  renderSegments();
  document.querySelector<HTMLElement>(`#${segment.id} .approve-button`)?.focus();
  showToast(`${segment.label} approved.`);
}

function exportScript(format: 'text' | 'markdown'): string {
  const approved = segments.filter((segment) => segment.status === 'approved').length;
  const header = format === 'markdown'
    ? `# Audio guide\n\n> ${approved} of ${segments.length} segments approved. Author review is required before publishing.\n`
    : `AUDIO GUIDE\n${approved} of ${segments.length} segments approved. Author review is required before publishing.\n`;
  const body = segments.map((segment, index) => {
    const checks = segment.issues.length
      ? segment.issues.map((issue) => `${format === 'markdown' ? '-' : '  '} [${issue.checked ? 'x' : ' '}] ${issue.text}`).join('\n')
      : `${format === 'markdown' ? '-' : '  '} [${segment.status === 'approved' ? 'x' : ' '}] Confirm wording and meaning.`;
    if (format === 'markdown') return `## ${index + 1}. ${segment.label} — ${statusLabel(segment.status)}\n\n**Source**\n\n\`\`\`text\n${segment.source}\n\`\`\`\n\n**Spoken route**\n\n${segment.narration}\n\n**Review checklist**\n\n${checks}`;
    return `${index + 1}. ${segment.label.toUpperCase()} — ${statusLabel(segment.status).toUpperCase()}\nSOURCE: ${segment.source}\nSPOKEN ROUTE: ${segment.narration}\nREVIEW CHECKLIST:\n${checks}`;
  }).join(format === 'markdown' ? '\n\n---\n\n' : '\n\n----------------------------------------\n\n');
  return `${header}\n${body}\n`;
}

function download(content: string, extension: string, type: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = `equation-audio-guide.${extension}`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast(`Exported ${link.download}.`);
}

sourceInput.addEventListener('input', () => {
  updateCount();
  sourceError.hidden = true;
  sourceInput.removeAttribute('aria-invalid');
  try { localStorage.setItem(draftKey, sourceInput.value); } catch { /* Storage may be disabled. */ }
});

sourceInput.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); buildGuide(); }
});

document.querySelector('#generate')!.addEventListener('click', buildGuide);
document.querySelector('#load-example')!.addEventListener('click', () => {
  if (!isDemo) {
    window.location.assign('/demo/');
    return;
  }
  loadDemoSample(true);
});
document.querySelector('#clear')!.addEventListener('click', () => {
  if (!sourceInput.value && !segments.length) { showToast('The working copy is already clear.'); return; }
  clearDialog.showModal();
});
document.querySelector('#confirm-clear')!.addEventListener('click', () => {
  sourceInput.value = '';
  segments = [];
  localStorage.removeItem(storageKey);
  localStorage.removeItem(draftKey);
  updateCount();
  renderSegments(false);
  window.setTimeout(() => { sourceInput.focus(); showToast(isDemo ? 'Demo changes cleared. Use Reset demo to restore the sample.' : 'Working copy cleared.'); }, 0);
});

segmentList.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLTextAreaElement)) return;
  const segment = getSegment(target.dataset.segment);
  if (!segment) return;
  segment.narration = target.value;
  if (segment.status === 'approved') segment.status = 'revised';
  saveGuide();
  const card = target.closest<HTMLElement>('.segment-card');
  const stamp = card?.querySelector<HTMLElement>('.status-stamp');
  if (stamp) stamp.textContent = statusLabel(segment.status);
  card?.classList.remove('status-approved');
  card?.classList.add(`status-${segment.status}`);
  updateSummary();
});

segmentList.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') return;
  const segment = getSegment(target.dataset.segment);
  const issue = segment?.issues.find((entry) => entry.id === target.dataset.issue);
  if (!segment || !issue) return;
  issue.checked = target.checked;
  if (segment.status === 'approved') segment.status = 'revised';
  renderSegments();
  document.querySelector<HTMLInputElement>(`#${segment.id} input[data-issue="${issue.id}"]`)?.focus();
});

segmentList.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  const segment = getSegment(target.dataset.segment);
  const card = target.closest<HTMLElement>('.segment-card');
  if (!segment || !card) return;
  if (target.dataset.action === 'approve') approveSegment(segment, card);
  if (target.dataset.action === 'restore') {
    segment.narration = segment.suggestedNarration;
    segment.status = 'needs-review';
    renderSegments();
    document.querySelector<HTMLTextAreaElement>(`#${segment.id}-narration`)?.focus();
    showToast('Suggestion restored.');
  }
});

document.querySelectorAll<HTMLButtonElement>('.filter-button').forEach((button) => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter as typeof currentFilter;
  document.querySelectorAll<HTMLButtonElement>('.filter-button').forEach((entry) => {
    const active = entry === button;
    entry.classList.toggle('is-active', active);
    entry.setAttribute('aria-pressed', String(active));
  });
  renderSegments();
}));

document.querySelector('#next-issue')!.addEventListener('click', () => {
  const open = segments.find((segment) => segmentHasOpenIssues(segment));
  if (!open) { showToast('No open proofing notes.'); return; }
  if (currentFilter === 'approved') {
    currentFilter = 'all';
    document.querySelectorAll<HTMLButtonElement>('.filter-button').forEach((button) => {
      const active = button.dataset.filter === 'all';
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderSegments();
  }
  const checkbox = document.querySelector<HTMLInputElement>(`#${open.id} input:not(:checked)`);
  checkbox?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  checkbox?.focus();
});

document.querySelector('#copy-script')!.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(exportScript('text')); showToast('Script copied to the clipboard.'); }
  catch { showToast('Clipboard access was blocked. Use Export .txt instead.'); }
});
document.querySelector('#export-text')!.addEventListener('click', () => download(exportScript('text'), 'txt', 'text/plain'));
document.querySelector('#export-markdown')!.addEventListener('click', () => download(exportScript('markdown'), 'md', 'text/markdown'));

function updateNetworkState(): void {
  const banner = document.querySelector<HTMLElement>('#network-banner')!;
  banner.hidden = navigator.onLine;
}
window.addEventListener('online', () => { updateNetworkState(); showToast('Back online. Your guide stayed local.'); });
window.addEventListener('offline', updateNetworkState);
updateNetworkState();

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));

configureRouteMetadata();
restoreGuide();
if (isDemo && (!sourceInput.value || !segments.length)) {
  loadDemoSample();
} else if (!sourceInput.value) {
  try { sourceInput.value = localStorage.getItem(draftKey) ?? ''; updateCount(); } catch { /* Storage may be disabled. */ }
}

if (isDemo) {
  document.querySelector('#reset-demo')?.addEventListener('click', () => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(draftKey);
    } catch { /* Storage may be disabled. */ }
    loadDemoSample(true);
  });
  document.querySelector<HTMLAnchorElement>('#start-real')?.addEventListener('click', () => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(draftKey);
      sessionStorage.removeItem(DEMO_SESSION_KEY);
    } catch { /* Storage may be disabled. */ }
  });
}
