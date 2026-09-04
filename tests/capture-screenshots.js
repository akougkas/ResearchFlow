import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const output = path.resolve(process.env.ARTIFACT_DIR || 'test-results/screenshots');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:8000/?demo=1';
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', error => errors.push(error.message));

try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Move the work forward' }).waitFor();
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

    if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
    console.log('✅ Gnosis Tasks browser journey passed with zero page errors');
} finally {
    await browser.close();
}
