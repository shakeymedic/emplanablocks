// End-to-end check in Chromium at phone and desktop sizes, served with the live CSP header.
// Run: node tests/e2e.mjs [screenshotDir]
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = new URL('..', import.meta.url).pathname;
const csp = readFileSync(join(root, 'netlify.toml'), 'utf8').match(/Content-Security-Policy = "([^"]+)"/)[1];
const types = { '.woff2': 'font/woff2', '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = join(root, p);
    if (!existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[extname(f)] || 'application/octet-stream', 'Content-Security-Policy': csp });
    res.end(readFileSync(f));
}).listen(0);
const base = `http://localhost:${server.address().port}/`;
const shots = process.argv[2];
if (shots) mkdirSync(shots, { recursive: true });

let failures = 0;
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${msg}`); if (!ok) failures++; };

const browser = await chromium.launch();
for (const [name, viewport] of [['phone', { width: 360, height: 740 }], ['small-phone', { width: 320, height: 640 }], ['desktop', { width: 1280, height: 860 }]]) {
    const ctx = await browser.newContext({ viewport, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/raw\.githubusercontent/.test(m.text())) errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    const noSideways = async (where) => check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${name}: no sideways scroll on ${where}`);

    await page.goto(base);
    check(await page.locator('.block-card').count() === 6, `${name}: 6 blocks on home`);
    await noSideways('home');
    if (shots) await page.screenshot({ path: `${shots}/${name}-home.png`, fullPage: true });

    // Generic checklist without a Trust
    await page.click('.block-card[data-id="fib"]');
    await page.waitForSelector('#noteText');
    check((await page.textContent('.callout')).includes('No Trust LocSSIP loaded'), `${name}: generic warning without a Trust`);

    // Choose UHB
    await page.goto(base);
    await page.selectOption('#trustSelect', 'uhb');
    check((await page.textContent('.block-card[data-id="fib"]')).includes('UHB LocSSIP'), `${name}: FIB shows UHB LocSSIP`);
    await page.click('.block-card[data-id="fib"]');
    await page.waitForSelector('#noteText');
    check((await page.textContent('.callout')).includes('UHB465_V2'), `${name}: UHB LocSSIP banner`);

    let note = await page.textContent('#noteText');
    check(!/consent: yes|complications: none/i.test(note), `${name}: blank note makes no claims`);

    await page.selectOption('#f-indication', 'Neck of femur fractures');
    await page.click('label[for="f-pre-intros"]');
    await page.fill('#f-pre-operator', 'Dr A Clinician, ST5');
    await page.click('label[for="f-pre-consent"]');
    await page.click('[data-field="pre.side"] >> text=LEFT');
    await page.click('[data-field="pre.allergies"] >> text=No');
    await page.click('text=Mark all absent');
    await page.click('text=Tick all discussed');
    await page.fill('#f-weight', '45');
    check((await page.textContent('#trustDose')).includes('30mls of 0.25%'), `${name}: Trust table picks <50kg band`);
    await page.click('#trustDose >> text=Use 30 ml');
    check((await page.inputValue('#f-ml')) === '30', `${name}: Use Trust volume fills 30 ml`);
    await page.click('#trustDose >> text=use it');
    check((await page.getAttribute('#doseResult .computed-value', 'data-tone')) === 'red', `${name}: 30 ml bupivacaine + 5 ml lidocaine at 45 kg flagged over maximum`);
    await page.fill('#f-weight', '50');
    check((await page.textContent('#trustDose')).includes('not covered'), `${name}: 50 kg gap warning`);
    await page.click('[data-field="sbyb.guidance"] >> text=Ultrasound guided');
    await page.click('[data-field="complications"] >> text=None observed');
    await page.click('[data-field="contra-3"] >> text=Present');
    check(await page.isVisible('#f-contra-discussedWith'), `${name}: discussed-with appears when a contraindication is present`);
    await page.fill('#f-contra-discussedWith', 'Dr B Consultant');

    note = await page.textContent('#noteText');
    check(note.includes('Side: Left'), `${name}: note has side`);
    check(note.includes('Present: High BMI (>40)'), `${name}: note has contraindication`);
    check(note.includes('Bupivacaine 0.25%: 30 ml (75 mg'), `${name}: note has dose`);
    check(note.includes('Complications: none observed'), `${name}: note has complications`);
    check(note.includes('NOT RECORDED IN THIS NOTE'), `${name}: note lists gaps`);

    await page.fill('#f-p-notes'.replace('f-p-notes', 'f-procNotes'), 'Mrs Smith tolerated well');
    check(await page.isVisible('#idWarning'), `${name}: identifier warning shown`);
    await page.fill('#f-procNotes', '');
    check(!(await page.isVisible('#idWarning')), `${name}: identifier warning clears`);

    await noSideways('guided FIB');
    if (shots) await page.screenshot({ path: `${shots}/${name}-fib-do.png`, fullPage: true });

    await page.click('.copy-bar >> text=Copy note').catch(() => page.click('#copyBtn'));
    if (name === 'desktop') {
        const clip = await page.evaluate(() => navigator.clipboard.readText());
        check(clip.startsWith('FASCIA ILIACA BLOCK (FIB): PROCEDURE NOTE'), `${name}: copied to clipboard`);
    }

    // Tabs keep what was entered
    await page.click('.tab >> text=Learn');
    await page.waitForSelector('.us-svg');
    await noSideways('learn');
    if (shots) await page.screenshot({ path: `${shots}/${name}-fib-learn.png`, fullPage: true });
    await page.click('.tab >> text=Do the block');
    check((await page.textContent('#noteText')).includes('Side: Left'), `${name}: entries kept across tabs`);

    await page.click('.tab >> text=Safety');
    await page.fill('#c-weight', '70');
    check((await page.textContent('#calcOut')).includes('Bolus 105 ml'), `${name}: lipid bolus for 70 kg`);
    await noSideways('safety');
    if (shots) await page.screenshot({ path: `${shots}/${name}-safety.png`, fullPage: true });

    // Nothing about the patient in local storage
    const stored = await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)));
    check(!/Smith|Clinician|LEFT|45/.test(stored), `${name}: no entries in local storage (${stored})`);

    check(errors.length === 0, `${name}: no console errors ${errors.join(' | ')}`);
    await ctx.close();
}
await browser.close();
server.close();
console.log(failures ? `${failures} check(s) failed` : 'All e2e checks passed');
process.exit(failures ? 1 : 0);
