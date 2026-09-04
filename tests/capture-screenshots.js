/**
 * Playwright E2E UI Visual Inspection & Screenshot Capture Script
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'path';
import process from 'process';

const SCRATCH_DIR = path.resolve(process.env.ARTIFACT_DIR || 'test-results/screenshots');
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8000';

async function runVisualInspection() {
    await mkdir(SCRATCH_DIR, { recursive: true });
    console.log('🌐 Launching Headless Chromium to visually inspect ResearchFlow...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    const consoleLogs = [];
    const pageErrors = [];

    page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => pageErrors.push(err.message));

    try {
        // 1. Load Main Dashboard
        console.log(`  1. Navigating to ${BASE_URL} ...`);
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCRATCH_DIR, '01_matrix_view.png') });

        // 2. Open New Task Modal
        console.log('  2. Testing Protocol Creation Modal...');
        await page.click('#add-task-btn');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCRATCH_DIR, '02_task_modal.png') });
        await page.click('#modal-cancel');
        await page.waitForTimeout(300);

        // 3. Switch to Kanban View
        console.log('  3. Testing Kanban View...');
        await page.click('button[data-id="KANBAN"]');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCRATCH_DIR, '03_kanban_view.png') });

        // 4. Switch to Timeline View
        console.log('  4. Testing Timeline View...');
        await page.click('button[data-id="TIMELINE"]');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCRATCH_DIR, '04_timeline_view.png') });

        // 5. Switch to Force Graph View
        console.log('  5. Testing Interactive Force Graph View...');
        await page.click('button[data-id="GRAPH"]');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCRATCH_DIR, '05_graph_view.png') });

        // 6. Test Voice Capture Modal
        console.log('  6. Testing Voice Capture Modal...');
        await page.click('button[data-id="VOICE"]');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCRATCH_DIR, '06_voice_modal.png') });
        await page.click('#btn-cancel-voice');
        await page.waitForTimeout(300);

        // 7. Test Productivity Analytics Dashboard
        console.log('  7. Testing Productivity Analytics Modal...');
        await page.click('button[data-id="ANALYTICS"]');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCRATCH_DIR, '07_analytics_modal.png') });
        await page.click('#analytics-ok');
        await page.waitForTimeout(300);

        // 8. Test Command Palette (Cmd+K)
        console.log('  8. Testing Command Palette (Cmd+K / Search)...');
        await page.keyboard.press('Control+k');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCRATCH_DIR, '08_command_palette.png') });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);

        // 9. Test Theme Switcher in System Settings
        console.log('  9. Testing System Menu & Cyberpunk Theme Switcher...');
        await page.click('button[data-id="SETTINGS"]');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCRATCH_DIR, '09_system_menu_themes.png') });

        // Click Terminal Matrix theme
        await page.click('button[data-theme="matrix"]');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCRATCH_DIR, '10_matrix_theme_applied.png') });
        await page.click('#system-menu-close');

        if (pageErrors.length > 0) {
            throw new Error(`Browser page errors: ${pageErrors.join('; ')}`);
        }

        console.log('\n✅ Visual inspection completed successfully!');
        console.log(`Console logs captured (${consoleLogs.length}):`);
        consoleLogs.slice(0, 5).forEach(l => console.log('  ', l));
        console.log(`Page errors (${pageErrors.length}):`, pageErrors);

    } catch (err) {
        console.error('❌ Visual inspection error:', err);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
}

runVisualInspection();
