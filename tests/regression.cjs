// Run with Node.js and Playwright available (no application dependencies are added).
// NODE_PATH may point to an existing Playwright installation. BROWSER_CHANNEL defaults to msedge.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.join(root, pathname === '/' ? 'index.html' : decodeURIComponent(pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
        res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' })[path.extname(file)] || 'application/octet-stream');
        res.end(fs.readFileSync(file));
    } catch { res.writeHead(404).end(); }
});

(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], viewport: { width: 1440, height: 1000 } });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        // Deterministic functional tests: CDN styling/chart rendering is outside this suite.
        if (!process.env.LIVE_ASSETS) await page.route('https://**/*', route => route.fulfill({ contentType: 'text/javascript', body: 'window.tailwind = {};' }));
        const url = `http://127.0.0.1:${server.address().port}/`;
        async function reload() {
            await page.goto(url);
            await page.addStyleTag({ content: '.hidden {display:none!important} .accordion-wrapper:not(.expanded){display:none}' });
        }
        await reload();
        assert.equal(await page.locator('.copy-table-button').count(), 4);

        // Base edit: fields are populated, editing does not create a copy or round stored precision.
        const original = await page.evaluate(() => JSON.parse(JSON.stringify(appMaterials[0])));
        await page.evaluate(() => { el.mat.value = 0; updateKpList(); openEditModal(); });
        assert.equal(await page.locator('#newMatName').inputValue(), original.name);
        assert.equal(await page.locator('#newMatKp').inputValue(), original.grades[0].kp);
        assert.ok(!(await page.locator('#newMatDesc').inputValue()).startsWith(original.name));
        if (process.env.QA_DIR) await page.screenshot({ path: path.join(process.env.QA_DIR, 'material-editor.png') });
        await page.locator('#newMatKp').fill('246');
        await page.locator('#newMatTableBody input[data-prop="Mu"][data-temp="20"]').fill('0,30123');
        await page.locator('#btnSaveAddMat').click();
        assert.equal(await page.evaluate(() => el.kp.value), '0');
        await reload();
        assert.equal(await page.evaluate(() => appMaterials[0].grades[0].kp), '246');
        assert.equal(await page.evaluate(() => appMaterials[0].grades[0].data.Mu[20]), 0.30123);
        assert.equal(await page.evaluate(() => coreDB[0].grades[0].kp), original.grades[0].kp);
        await page.evaluate(() => { el.mat.value = 0; updateKpList(); openEditModal(); });
        assert.equal(await page.locator('#newMatTableBody input[data-prop="Mu"][data-temp="20"]').inputValue(), '0.30123');
        await page.locator('#btnCancelAddMat').click();

        // Adding a grade to a base material survives reload and keeps the saved grade selected.
        await page.locator('#btnOpenAddMat').click();
        await page.locator('#newMatName').fill(original.name);
        await page.locator('#newMatKp').fill('999');
        await page.locator('#newMatDesc').fill('Тестовий сортамент');
        await page.locator('#btnSaveAddMat').click();
        assert.equal(await page.evaluate(() => appMaterials[el.mat.value].grades[el.kp.value].kp), '999');
        await reload();
        assert.equal(await page.evaluate(() => appMaterials[0].grades.at(-1).kp), '999');
        await page.locator('#btnOpenAddMat').click();
        await page.locator('#newMatName').fill(original.name);
        await page.locator('#newMatKp').fill('999');
        await page.locator('#newMatDesc').fill('Тестовий сортамент');
        await page.locator('#btnSaveAddMat').click();
        assert.equal(await page.evaluate(() => appMaterials[0].grades.length), original.grades.length + 1);
        assert.equal(await page.locator('#addMatModal').evaluate(el => el.classList.contains('hidden')), false);
        page.once('dialog', dialog => dialog.accept());
        await page.locator('#btnCancelAddMat').click();

        // Editing must not merge two different material names accidentally.
        await page.evaluate(() => { el.mat.value = 0; updateKpList(); openEditModal(); });
        await page.locator('#newMatName').fill(await page.evaluate(() => appMaterials[1].name));
        await page.locator('#btnSaveAddMat').click();
        assert.equal(await page.evaluate(() => appMaterials[0].name), original.name);
        page.once('dialog', dialog => dialog.accept());
        await page.locator('#btnCancelAddMat').click();

        // Input validation must neither silently truncate text nor change the material on failure.
        await page.evaluate(() => { el.mat.value = 0; updateKpList(); openEditModal(); });
        const strengthInput = page.locator('#newMatTableBody input[data-prop="RTm"][data-temp="20"]');
        await strengthInput.fill('245abc');
        await page.locator('#btnSaveAddMat').click();
        assert.equal(await page.locator('#addMatModal').evaluate(el => el.classList.contains('hidden')), false);
        assert.equal(await page.evaluate(() => appMaterials[0].grades[0].data.RTm[20]), original.grades[0].data.RTm[20]);
        await strengthInput.fill('500');
        await page.locator('#newMatName').fill('Перейменована сталь');
        await page.evaluate(() => {
            reportMaterials = [{ matIndex: 0, kpIndex: 0, matName: appMaterials[0].name, elements: ['Фланець', 'Шпильки'] }];
            reportMaterialsEquip = [{ ...reportMaterials[0], elements: ['Шпильки'] }];
            favoriteMaterials = [appMaterials[0].name];
        });
        // Simulate quota failure; the form remains open and both in-memory and saved data survive.
        await page.evaluate(() => {
            window.originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = function () { throw new DOMException('Quota', 'QuotaExceededError'); };
        });
        await page.locator('#btnSaveAddMat').click();
        assert.equal(await page.evaluate(() => appMaterials[0].name), original.name);
        assert.equal(await page.locator('#newMatName').inputValue(), 'Перейменована сталь');
        await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
        await page.locator('#btnSaveAddMat').click();
        await reload();
        assert.equal(await page.evaluate(() => reportMaterials[0].matName), 'Перейменована сталь');
        assert.equal(await page.evaluate(() => reportMaterialsEquip[0].matName), 'Перейменована сталь');
        assert.equal(await page.evaluate(() => favoriteMaterials[0]), 'Перейменована сталь');
        assert.equal(await page.evaluate(() => appMaterials[0].grades.length), original.grades.length + 1);

        // Report temperature changes update all tables and persist.
        await page.evaluate(() => { switchTab('report'); updateReportTemp(1, 200); });
        assert.equal(await page.locator('#reportStressTableHeader select').nth(1).inputValue(), '200');
        await reload();
        assert.equal(await page.evaluate(() => reportTemperatures[1]), 200);

        // Copy all four reports through the real Clipboard API: HTML, headings, merged cells, current selects.
        await page.evaluate(() => { switchTab('report'); renderReportTableEquip(); });
        if (process.env.QA_DIR) await page.screenshot({ path: path.join(process.env.QA_DIR, 'report-tables.png') });
        for (const id of ['reportTableWrapper', 'reportStressTableWrapper', 'reportTableEquipWrapper', 'reportStressTableEquipWrapper']) {
            const result = await page.evaluate(async id => {
                await copyReportTable(document.getElementById(id).querySelector('table'));
                const items = await navigator.clipboard.read();
                const item = items.find(item => item.types.includes('text/html'));
                const html = await (await item.getType('text/html')).text();
                const doc = new DOMParser().parseFromString(html, 'text/html');
                return { html, tables: doc.querySelectorAll('table').length, merged: !!doc.querySelector('[rowspan]'),
                    controls: doc.querySelectorAll('button,select,input,svg').length,
                    text: await (await item.getType('text/plain')).text() };
            }, id);
            assert.equal(result.tables, 1, id);
            assert.equal(result.controls, 0, id);
            assert.ok(result.merged, id);
            assert.ok(result.text.includes('Перейменована сталь'), id);
            assert.ok(result.text.includes('Матеріал'), id);
            if (!id.includes('StressTableEquip')) assert.ok(result.text.includes('200'), id);
        }
        // Real fallback copy (for browsers without the asynchronous HTML Clipboard API).
        assert.equal(await page.evaluate(() => copyHTMLFallback('<table><tr><td>Fallback</td></tr></table>', 'Fallback')), true);
        assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'Fallback');

        // Ctrl+C selection across two tables stays as two tables; material name is not discarded.
        const selection = await page.evaluate(() => {
            clearCellSelection();
            for (const id of ['reportTableBody', 'reportStressTableBody']) document.getElementById(id).querySelector('td').classList.add('cell-selected');
            const data = new DataTransfer();
            document.dispatchEvent(new ClipboardEvent('copy', { clipboardData: data, cancelable: true }));
            return { html: data.getData('text/html'), text: data.getData('text/plain') };
        });
        assert.equal((selection.html.match(/<table/g) || []).length, 2);
        assert.ok(selection.text.includes('Перейменована сталь'));

        // Custom names must remain text in every report, even if they contain HTML.
        await page.evaluate(() => {
            reportMaterials[0].matName = '<img src=x onerror="window.injected=true">';
            reportMaterialsEquip[0].matName = reportMaterials[0].matName;
            renderReportTable(); renderReportStressTable(); renderReportTableEquip();
        });
        assert.equal(await page.locator('#view-report img').count(), 0);
        await page.evaluate(() => {
            appMaterials[0].name = "Сталь ' <img src=x onerror=window.injected=true>";
            updateMaterialList();
            el.mat.value = 0;
            updateKpList();
        });
        assert.equal(await page.locator('#recentMaterialsList img').count(), 0);
        await page.locator('#recentMaterialsList button').first().click();
        assert.equal(await page.evaluate(() => window.injected), undefined);

        // Legacy extensions are migrated without duplicate grades, and malformed lists do not crash init.
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('pnae_materials_extensions', JSON.stringify({ [coreDB[0].name.toLowerCase()]: [{ kp: '888', description: 'Legacy', data: {} }] }));
            localStorage.setItem('pnae_report_materials', 'null');
            localStorage.setItem('pnae_favorites', '{}');
            localStorage.setItem('pnae_materials_custom', '[null]');
        });
        await reload();
        assert.equal(await page.evaluate(() => appMaterials[0].grades.at(-1).kp), '888');
        assert.equal(await page.evaluate(() => reportMaterials.length), 0);
        assert.equal(await page.evaluate(() => favoriteMaterials.length), 0);
        await reload();
        assert.equal(await page.evaluate(() => appMaterials[0].grades.filter(g => g.kp === '888').length), 1);

        const downloadPromise = page.waitForEvent('download');
        await page.evaluate(() => exportToJS());
        const download = await downloadPromise;
        assert.equal(download.suggestedFilename(), 'data.js');
        assert.deepEqual(errors, []);
        console.log('PASS: editing, persistence, legacy migration, validation, quota rollback, rename references, report temperatures, four HTML clipboards, fallback, selection, escaping and export.');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
