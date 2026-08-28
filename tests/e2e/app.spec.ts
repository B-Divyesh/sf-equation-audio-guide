import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('builds and reviews a complete technical route by keyboard', async ({ page }) => {
  const source = page.getByLabel('Markdown, LaTeX, MathML, or code');
  await source.fill('# Energy\n\nThe relation is $E = mc^2$.\n\n| Term | Role |\n| --- | --- |\n| E | energy |');
  await source.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');

  await expect(page.getByText('Built 4 route segments.')).toBeVisible();
  await expect(page.locator('.segment-card')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Equation', exact: true })).toBeVisible();
  await expect(page.locator('.narration-input').filter({ hasText: '' }).nth(2)).toHaveValue(/Equation: E equals m c squared/);

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
  for await (const chunk of stream) content += chunk.toString();
  expect(content).toContain('Author review is required');
  expect(content).toContain('[ ] Confirm whether each vertical bar');
});

test('has no serious accessibility violations in empty and generated states', async ({ page }) => {
  const emptyResults = await new AxeBuilder({ page }).analyze();
  expect(emptyResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);

  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: /Build the spoken route/ }).click();
  const generatedResults = await new AxeBuilder({ page }).analyze();
  expect(generatedResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('fits a 390px viewport and legal pages have the required landmarks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);

  await page.goto('/privacy/');
  await expect(page).toHaveTitle(/Privacy/);
  await expect(page.getByRole('main')).toBeVisible();
  await page.goto('/terms/');
  await expect(page).toHaveTitle(/Terms/);
  await expect(page.getByRole('main')).toBeVisible();
});

test('loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.reload();
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});
