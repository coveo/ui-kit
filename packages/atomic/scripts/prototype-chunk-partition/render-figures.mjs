// PROTOTYPE — screenshots the figures of a rendered report page as 760 px wide PNGs at 2x, for Confluence.
// usage: node render-figures.mjs <report.html> <outDir> <sectionIndex> <name1,name2,...>
import {chromium} from '@playwright/test';
const [html, outDir, sectionIndex = '0', names = 'figure'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 760, height: 1200}, deviceScaleFactor: 2, colorScheme: 'light'});
await page.goto(`file://${html}`);
await page.waitForTimeout(1500);
const figures = page.locator('main section').nth(Number(sectionIndex)).locator('figure');
const n = await figures.count();
const list = names.split(',');
for (let i = 0; i < n && i < list.length; i++) {
  const fig = figures.nth(i);
  await fig.scrollIntoViewIfNeeded();
  const box = await fig.boundingBox();
  await fig.screenshot({path: `${outDir}/${list[i]}.png`});
  console.log(`${list[i]}.png  ${Math.round(box.width)}x${Math.round(box.height)} css px`);
}
await browser.close();
