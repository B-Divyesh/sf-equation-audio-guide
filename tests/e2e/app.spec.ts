import { expect, test, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const realStorageKey = 'equation-audio-guide:v1';
const demoStorageKey = 'demo:equation-audio-guide:v1';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function openCleanDemo(page: Page): Promise<void> {
  await page.goto('/demo/');
  await expect(page).toHaveTitle('Demo — Equation Audio Guide');
  await expect(page.locator('#demo-banner')).toBeVisible();
  await expect(page.locator('#demo-banner')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.getByLabel('Markdown, LaTeX, MathML, or code')).toHaveValue(/How gradient descent moves/);
  await expect(page.locator('.segment-card')).toHaveCount(9);
}

async function waitForServiceWorkerControl(page: Page): Promise<void> {
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return Boolean(registration?.active);
  }, undefined, { timeout: 15_000 });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) return;
    await page.reload({ waitUntil: 'domcontentloaded' });
  }

  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 10_000 }).toBe(true);
}

async function startIsolatedDemo(browser: Browser): Promise<{ page: Page; close: () => Promise<void> }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/demo/');
  return {
    page,
    close: async () => {
      await context.setOffline(false);
      await context.close();
    },
  };
}

test('builds and reviews a complete technical route by keyboard', async ({ page }) => {
  const source = page.getByLabel('Markdown, LaTeX, MathML, or code');
  await source.fill('# Energy\n\nThe relation is $E = mc^2$.\n\n| Term | Role |\n| --- | --- |\n| E | energy |');
  await source.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');

  await expect(page.getByText('Built 4 route segments.')).toBeVisible();
  await expect(page.locator('.segment-card')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Equation', exact: true })).toBeVisible();
  await expect(page.locator('.narration-input').nth(2)).toHaveValue(/Equation: E equals m c squared/);

  const table = page.locator('.segment-card').filter({ has: page.getByRole('heading', { name: 'Table', exact: true }) });
  await table.locator('input[type="checkbox"]').first().check();
  await table.locator('input[type="checkbox"]').nth(1).check();
  await table.getByRole('button', { name: 'Approve segment' }).click();
  await expect(table.getByText('Approved', { exact: true })).toBeVisible();
});

test('reports source errors and safely displays arbitrary HTML as text', async ({ page }) => {
  const source = page.getByLabel('Markdown, LaTeX, MathML, or code');
  await source.fill('```js\nalert(1)');
  await page.getByRole('button', { name: /Build the spoken route/ }).click();
  await expect(page.getByRole('alert')).toContainText('not closed');

  await source.fill('<img src=x onerror="window.__unsafe=true">');
  await page.getByRole('button', { name: /Build the spoken route/ }).click();
  await expect(page.locator('.source-excerpt')).toContainText('onerror');
  await expect(page.evaluate(() => (window as typeof window & { __unsafe?: boolean }).__unsafe)).resolves.toBeUndefined();
});

test('exports a reviewable Markdown checklist', async ({ page }) => {
  await page.getByLabel('Markdown, LaTeX, MathML, or code').fill('The value is $|x|$.');
  await page.getByRole('button', { name: /Build the spoken route/ }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export .md' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('equation-audio-guide.md');
  const stream = await download.createReadStream();
  let content = '';
  for await (const chunk of stream!) content += chunk.toString();
  expect(content).toContain('Author review is required');
  expect(content).toContain('[ ] Confirm whether each vertical bar');
});

test('has no serious accessibility violations in empty and generated states', async ({ page }) => {
  const emptyResults = await new AxeBuilder({ page }).analyze();
  expect(emptyResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);

  await openCleanDemo(page);
  const generatedResults = await new AxeBuilder({ page }).analyze();
  expect(generatedResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('fits a 390px viewport and legal pages have the required landmarks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);

  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Equation Audio Guide');
  await expect(page.locator('#demo-banner')).toBeVisible();
  await page.goto('/privacy/');
  await expect(page).toHaveTitle('Privacy — Equation Audio Guide');
  await expect(page.getByRole('main')).toBeVisible();
  await page.goto('/terms/');
  await expect(page).toHaveTitle('Terms — Equation Audio Guide');
  await expect(page.getByRole('main')).toBeVisible();
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Equation Audio Guide');
  await expect(page.getByRole('heading', { level: 1, name: 'This page was not found' })).toBeVisible();
  const missingResponse = await page.goto('/missing-page');
  expect(missingResponse?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Open the editor' })).toBeVisible();
});

test('loads the demo without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await openCleanDemo(page);
  expect(errors).toEqual([]);
});

test('sets route titles, canonical URLs, and social image metadata', async ({ page }) => {
  await expect(page).toHaveTitle('Equation Audio Guide — editable technical narration');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://equation-audio-guide.sociobot.in/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /equation-audio-guide-social\.jpg$/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');

  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Equation Audio Guide');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://equation-audio-guide.sociobot.in/demo');
  await page.goto('/privacy/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://equation-audio-guide.sociobot.in/privacy/');
  await page.goto('/terms/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://equation-audio-guide.sociobot.in/terms/');
});

test('@claim:demo-sandbox opens isolated sample data and leaves real work unchanged', async ({ page }) => {
  const realGuide = JSON.stringify({ source: 'Private article', segments: [], savedAt: 1 });
  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [realStorageKey, realGuide]);
  await page.getByRole('link', { name: 'Try it with sample data' }).click();

  await expect(page.locator('#demo-banner')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.getByLabel('Markdown, LaTeX, MathML, or code')).toHaveValue(/How gradient descent moves/);
  await expect(page.locator('.segment-card')).toHaveCount(9);
  await page.getByLabel('Markdown, LaTeX, MathML, or code').fill('Demo-only edit $x^2$.');
  await page.getByRole('button', { name: /Build the spoken route/ }).click();

  const storage = await page.evaluate(([realKey, demoKey]) => ({ real: localStorage.getItem(realKey), demo: localStorage.getItem(demoKey) }), [realStorageKey, demoStorageKey]);
  expect(storage.real).toBe(realGuide);
  expect(storage.demo).toContain('Demo-only edit');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('Markdown, LaTeX, MathML, or code')).toHaveValue(/How gradient descent moves/);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveTitle('Equation Audio Guide — editable technical narration');
  await expect(page.getByLabel('Markdown, LaTeX, MathML, or code')).toHaveValue('Private article');
  await expect(page.evaluate((key) => localStorage.getItem(key), demoStorageKey)).resolves.toBeNull();
});

test('@claim:supported-input creates editable scripts from technical article parts', async ({ page }) => {
  await openCleanDemo(page);
  const source = page.getByLabel('Markdown, LaTeX, MathML, or code');
  await source.fill('# Area\n\nUse $A = \\pi r^2$.\n\n<math><mfrac><mi>a</mi><mi>b</mi></mfrac></math>\n\n```js\nconst area = pi * r * r;\n```\n\n| Name | Value |\n| --- | --- |\n| radius | 2 |\n\n![Circle with radius r](circle.png)');
  await page.getByRole('button', { name: /Build the spoken route/ }).click();

  await expect(page.locator('.segment-card')).toHaveCount(7);
  await expect(page.getByRole('heading', { name: 'Equation', exact: true })).toHaveCount(2);
  await expect(page.getByRole('heading', { name: 'Code', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Table', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Figure', exact: true })).toBeVisible();
  const narration = page.locator('.narration-input').first();
  await narration.fill('Read the section title before the equation.');
  await expect(narration).toHaveValue('Read the section title before the equation.');
});

test('@claim:deterministic-review repeats suggestions and shows ambiguity checks', async ({ page }) => {
  await openCleanDemo(page);
  const source = page.getByLabel('Markdown, LaTeX, MathML, or code');
  await source.fill('The value is $|x| + 2y$.');
  await page.getByRole('button', { name: /Build the spoken route/ }).click();
  const equationReading = page.locator('.narration-input').nth(1);
  const firstReading = await equationReading.inputValue();
  await expect(page.locator('.proofing-notes')).toContainText('vertical bar');
  await page.getByRole('button', { name: /Build the spoken route/ }).click();
  await expect(equationReading).toHaveValue(firstReading);
});

test('@claim:review-states records approval and later revisions', async ({ page }) => {
  await openCleanDemo(page);
  const headingCard = page.locator('.segment-card').filter({ has: page.getByRole('heading', { name: 'Section heading', exact: true }) });
  await headingCard.getByRole('button', { name: 'Approve segment' }).click();
  await expect(headingCard.getByText('Approved', { exact: true })).toBeVisible();
  await headingCard.locator('.narration-input').fill('Explain this heading before the article.');
  await expect(headingCard.getByText('Revised', { exact: true })).toBeVisible();
});

test('@claim:text-export downloads plain text and Markdown review scripts', async ({ page }) => {
  await openCleanDemo(page);
  const textDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export .txt' }).click();
  const textFile = await textDownload;
  const textStream = await textFile.createReadStream();
  let text = '';
  for await (const chunk of textStream!) text += chunk.toString();
  expect(textFile.suggestedFilename()).toBe('equation-audio-guide.txt');
  expect(text).toContain('REVIEW CHECKLIST');

  const markdownDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export .md' }).click();
  const markdownFile = await markdownDownload;
  const markdownStream = await markdownFile.createReadStream();
  let markdown = '';
  for await (const chunk of markdownStream!) markdown += chunk.toString();
  expect(markdownFile.suggestedFilename()).toBe('equation-audio-guide.md');
  expect(markdown).toContain('## 1. Section heading');
});

test('@claim:demo-persistence keeps only the demo working copy after reload', async ({ page }) => {
  await openCleanDemo(page);
  const source = page.getByLabel('Markdown, LaTeX, MathML, or code');
  await source.fill('A saved demo equation is $x^2$.');
  await page.getByRole('button', { name: /Build the spoken route/ }).click();
  await page.reload();
  await expect(source).toHaveValue('A saved demo equation is $x^2$.');
  await expect(page.locator('.segment-card')).toHaveCount(2);
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toContain(demoStorageKey);
  expect(keys).not.toContain(realStorageKey);
});

test('@claim:offline-reload reloads the cached demo and announces offline state', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Offline behavior is covered in Chromium.');
  const demo = await startIsolatedDemo(browser);
  try {
    await waitForServiceWorkerControl(demo.page);
    await demo.page.context().setOffline(true);
    await demo.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(demo.page).toHaveTitle('Demo — Equation Audio Guide');
    await expect(demo.page.locator('#demo-banner')).toBeVisible();
    await expect(demo.page.locator('#network-banner')).toBeVisible();
    await expect(demo.page.locator('.segment-card')).toHaveCount(9);
  } finally {
    await demo.close();
  }
});

test('@claim:local-only does not send entered article text over the network', async ({ page }) => {
  const requests: { method: string; origin: string; body: string | null }[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    requests.push({ method: request.method(), origin: url.origin, body: request.postData() });
  });
  await openCleanDemo(page);
  await page.getByLabel('Markdown, LaTeX, MathML, or code').fill('Private source text $x^2$.');
  await page.getByRole('button', { name: /Build the spoken route/ }).click();

  expect(requests.every((request) => request.origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(requests.every((request) => request.method === 'GET' && request.body === null)).toBe(true);
});

test('@claim:no-account lets a visitor create a sample script without signing in', async ({ page }) => {
  await openCleanDemo(page);
  await expect(page.locator('.segment-card')).toHaveCount(9);
  await expect(page.locator('input[type="password"], input[name*="email" i], input[name*="user" i]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /sign in|log in|create account/i })).toHaveCount(0);
});

test('@claim:text-not-audio creates a downloadable script without an audio player', async ({ page }) => {
  await openCleanDemo(page);
  await expect(page.locator('audio, video')).toHaveCount(0);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export .txt' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('equation-audio-guide.txt');
});

test('@claim:no-third-party-runtime uses only first-party runtime requests', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await openCleanDemo(page);
  await page.getByRole('button', { name: 'Export .md' }).click();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
});

test('@claim:raw-html-text keeps article HTML from running', async ({ page }) => {
  await openCleanDemo(page);
  await page.getByLabel('Markdown, LaTeX, MathML, or code').fill('<img src=x onerror="window.__demoUnsafe=true">');
  await page.getByRole('button', { name: /Build the spoken route/ }).click();
  await expect(page.locator('.source-excerpt')).toContainText('onerror');
  await expect(page.evaluate(() => (window as typeof window & { __demoUnsafe?: boolean }).__demoUnsafe)).resolves.toBeUndefined();
});
