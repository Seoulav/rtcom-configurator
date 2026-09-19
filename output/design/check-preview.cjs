const { chromium } = require('C:/Users/khk00/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1000 }, colorScheme: 'light' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.join(__dirname, 'preview-check.html')).href);
    const frame = page.frameLocator('iframe');
    const root = frame.locator('#rtcom-design');
    const next = root.locator('[data-action=next]');
    await root.locator('.rt-family').first().waitFor();
    assert.equal(await root.locator('.rt-family').count(), 3);
    assert.equal(await root.locator('img').evaluateAll(images => images.every(i => i.complete && i.naturalWidth > 0)), true);
    await root.screenshot({ path: path.join(__dirname, 'preview-family.png') });
    await next.click();
    assert.equal(await next.isDisabled(), true);
    await root.locator('[data-model="XDM-12"]').click();
    await root.screenshot({ path: path.join(__dirname, 'preview-chassis.png') });
    await next.click();
    await root.locator('[data-card="XDM-CIS100"]').click();
    await root.locator('[data-slot="out-a"]').click();
    await root.locator('[data-card="XDM-COS100"]').click();
    await root.screenshot({ path: path.join(__dirname, 'preview-cards.png') });
    await next.click();
    await root.locator('[data-owner="in-a"][data-link=device]').selectOption('XDM-CTR100 · TX');
    await root.locator('[data-owner="in-a"][data-link=count]').selectOption('2');
    await root.locator('[data-owner="out-a"][data-link=device]').selectOption('XDM-CTR100 · RX');
    await root.locator('[data-owner="out-a"][data-link=count]').selectOption('3');
    await root.screenshot({ path: path.join(__dirname, 'preview-extenders.png') });
    await next.click();
    assert.match(await root.locator('tbody').innerText(), /XDM-CTR100\s+5/);
    await next.click();
    for (const format of ['CSV', 'JSON', 'PDF']) {
      await root.locator(`[data-format="${format}"]`).click();
      assert.equal(await root.locator(`[data-format="${format}"]`).getAttribute('aria-pressed'), 'true');
    }
    await root.screenshot({ path: path.join(__dirname, 'preview-export.png') });
    await next.click();
    await root.locator('button[data-family="SPX"]').click();
    await next.click();
    await root.locator('[data-model="SPX-M3236"]').click();
    await next.click();
    await root.locator('[data-card="SPX-HIS8"]').click();
    await root.locator('[data-slot="out-a"]').click();
    await root.locator('[data-card="SPX-COS12"]').click();
    await next.click();
    await root.locator('[data-owner="out-a"][data-link=device]').selectOption('SPX-RX');
    await root.locator('[data-owner="out-a"][data-link=count]').selectOption('12');
    assert.match(await root.innerText(), /12포트 중 12개 연결/);
    await root.locator('[data-jump="0"]').click();
    await root.locator('button[data-family="VDM"]').click();
    await next.click();
    await root.locator('[data-model="VDM-8X"]').click();
    await next.click();
    await root.locator('[data-card="FIS4-U"]').click();
    await root.locator('[data-slot="out-a"]').click();
    await root.locator('[data-card="QOS4S-U"]').click();
    assert.match(await root.locator('.rt-counts').innerText(), /2\s*출력 포트/);
    await next.click();
    assert.match(await root.innerText(), /개별 호환 관계 확인 후/);
    assert.equal(await root.locator('select[data-link=device]').count(), 0);
    await root.locator('[data-jump="0"]').click();
    await root.locator('button[data-family="XDM"]').click();
    for (const width of [1024, 720, 480, 320]) {
      await page.setViewportSize({ width, height: 1200 });
      const fit = await root.evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth }));
      assert.ok(fit.scroll <= fit.width + 1, `Family overflow at ${width}: ${JSON.stringify(fit)}`);
      if (width === 320) await root.screenshot({ path: path.join(__dirname, 'preview-mobile.png') });
    }
    await next.click();
    await root.locator('[data-model="XDM-12"]').click();
    await next.click();
    await root.locator('[data-card="XDM-CIS100"]').click();
    for (let step = 2; step < 6; step++) {
      const fit = await root.evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth }));
      assert.ok(fit.scroll <= fit.width + 1, `Step ${step} overflow on mobile`);
      if (step < 5) await next.click();
    }
    await root.locator('[data-jump="0"]').click();
    await page.setViewportSize({ width: 1080, height: 1000 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await root.screenshot({ path: path.join(__dirname, 'preview-dark.png') });
    assert.deepEqual(errors, []);
    console.log('PASS: all 3 families, chassis gating, card editing, XDM TX/RX aggregation, SPX 12-port count, VDM 2-port exception and pending compatibility, all export previews, 320/480/720/1024px fit, dark theme; no page errors.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
