// UI integration test: real browser (Playwright/Chromium) against index.html served locally.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
let server; let browser; let page; let url;

before(async () => {
  server = createServer(async (req, res) => {
    const path = normalize(join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url)));
    if (!path.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    let body;
    try { body = await readFile(path); } catch { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'text/plain' }).end(body);
  }).listen(0);
  url = `http://127.0.0.1:${server.address().port}/`;
  browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  page = await browser.newPage();
});
after(async () => { await browser?.close(); server?.close(); });

const result = () => page.getByTestId('result').innerText();

test('UI: filter -> select room -> check -> switch room refreshes result (F1, F2, F5, AC4)', async () => {
  await page.goto(url);
  assert.equal(await page.locator('.room').count(), 5);
  await page.getByText('Whiteboard', { exact: true }).click();
  assert.equal(await page.locator('.room').count(), 4); // A-101, B-204, C-305, E-012
  await page.fill('#attendees', '4');
  await page.check('input[value="A-101"]');
  await page.fill('#start', '11:00');
  await page.fill('#end', '12:00');
  assert.match(await result(), /^Available/);
  await page.check('input[value="C-305"]'); // C-305 has 11:00-12:00
  assert.match(await result(), /Unavailable[\s\S]*11:00-12:00/);
});

test('UI: selected room filtered out -> selection cleared; no match -> empty state (F4, F5)', async () => {
  await page.fill('#attendees', '5'); // C-305 (cap 4) disappears
  assert.equal(await page.locator('input[value="C-305"]').count(), 0);
  assert.match(await result(), /Select a room/);
  await page.fill('#attendees', '100');
  assert.match(await page.getByTestId('empty-state').innerText(), /No rooms match/);
});

test('UI: blocked room shows Blocked badge and Unavailable (F3)', async () => {
  await page.goto(url);
  await page.fill('#attendees', '50');
  await page.check('input[value="D-110"]');
  await page.fill('#start', '15:00');
  await page.fill('#end', '16:00');
  assert.equal(await page.locator('[data-room="D-110"] .badge').innerText(), 'Blocked');
  assert.match(await result(), /Unavailable[\s\S]*blocked/);
});

test('UI: mobile width 360px has no horizontal scroll (AC6)', async () => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(url);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert.equal(overflow, false);
});
