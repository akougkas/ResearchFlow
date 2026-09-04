import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const output = path.resolve(process.env.ARTIFACT_DIR || 'test-results/screenshots');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:8000/?demo=1';
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Move the work forward' }).waitFor();
    const accessibility = await new AxeBuilder({ page }).analyze();
    if (accessibility.violations.length) {
        const details = accessibility.violations
            .map(
                (item) =>
                    `${item.id}: ${item.nodes.map((node) => node.target.join(' ')).join(', ')}`,
            )
            .join('; ');
        throw new Error(`Accessibility violations: ${details}`);
    }
    await page.screenshot({ path: path.join(output, '01-focus.png'), fullPage: true });

    await page.getByRole('button', { name: 'All work' }).click();
    await page.getByPlaceholder('Search titles, notes, or tags').fill('pipeline');
    await page.getByText('Validate preprocessing pipeline').waitFor();
    await page.screenshot({ path: path.join(output, '02-search.png'), fullPage: true });
    await page.getByPlaceholder('Search titles, notes, or tags').fill('');

    await page.getByRole('button', { name: 'Board' }).click();
    await page.getByRole('heading', { name: 'Research pipeline' }).waitFor();
    await page.screenshot({ path: path.join(output, '03-board.png'), fullPage: true });

    await page.getByRole('button', { name: 'Schedule' }).click();
    await page.getByRole('heading', { name: 'What is coming' }).waitFor();
    await page.screenshot({ path: path.join(output, '04-schedule.png'), fullPage: true });

    await page.getByRole('button', { name: 'Focus' }).click();
    await page.locator('.focus-card').first().click();
    await page.locator('.detail-panel').waitFor();
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(output, '05-detail.png'), fullPage: true });
    await page.locator('.detail-panel [data-action="close-detail"]').click();
    await page.getByRole('button', { name: 'Add task' }).click();
    await page.getByRole('heading', { name: 'Add research work' }).waitFor();
    await page.screenshot({ path: path.join(output, '06-capture.png'), fullPage: true });
    await page
        .getByPlaceholder('e.g. Validate benchmark results')
        .fill('Reproduce scaling result on Ares');
    await page.getByRole('button', { name: 'Add to workspace' }).click();
    await page.getByText('Reproduce scaling result on Ares').waitFor();
    await page.getByText('Reproduce scaling result on Ares').click();
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.locator('input[name="text"]').fill('Reproduce scaling result on Ares cluster');
    await page.getByRole('button', { name: 'Save changes' }).click();
    const editedTask = page.getByRole('main').getByText('Reproduce scaling result on Ares cluster');
    await editedTask.waitFor();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export backup' }).click();
    const download = await downloadPromise;
    if (!download.suggestedFilename().endsWith('.json')) {
        throw new Error('Backup export was not JSON');
    }

    await editedTask.click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).click();
    await editedTask.waitFor({ state: 'detached' });

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobile = await mobileContext.newPage();
    mobile.on('pageerror', (error) => errors.push(error.message));
    await mobile.goto(baseUrl, { waitUntil: 'networkidle' });
    await mobile.locator('.mobile-menu').click();
    await mobile.locator('.sidebar').waitFor();
    await mobile.screenshot({ path: path.join(output, '07-mobile.png'), fullPage: true });
    await mobileContext.close();

    if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
    console.log('✅ Gnosis Tasks browser journey passed with zero page errors');
} finally {
    await browser.close();
}
