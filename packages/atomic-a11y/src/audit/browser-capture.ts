import {
  type AccessibilityNode,
  diffAccessibilityTrees,
} from './accessibility-tree.js';
import type {PlaywrightBrowser, PlaywrightPage} from './types.js';

export interface BrowserContext {
  browser: PlaywrightBrowser;
  pages: PlaywrightPage[];
}

export async function initBrowser(
  concurrency: number
): Promise<BrowserContext> {
  const {chromium} = await import('playwright' as string);
  const browser = await chromium.launch({headless: true});
  const pages = await Promise.all(
    Array.from({length: concurrency}, async () => {
      const page = await browser.newPage();
      await page.setViewportSize({width: 1024, height: 768});
      return page;
    })
  );
  return {browser, pages};
}

export async function navigateToStory(
  page: PlaywrightPage,
  storybookUrl: string,
  storyId: string
): Promise<void> {
  const url = `${storybookUrl}/iframe.html?id=${storyId}&viewMode=story`;
  await page.goto(url, {waitUntil: 'networkidle', timeout: 30000});
  // Wait for component to render
  await page.waitForTimeout(1000);
}

export interface CaptureResult {
  screenshot: string;
  accessibilityTree: AccessibilityNode | null;
}

export async function captureDefaultViewport(
  page: PlaywrightPage
): Promise<CaptureResult> {
  await page.setViewportSize({width: 1024, height: 768});
  await page.waitForTimeout(300);

  const screenshot = (
    await page.screenshot({type: 'png', fullPage: true})
  ).toString('base64');
  const accessibilityTree = await page.accessibility.snapshot({
    interestingOnly: false,
  });

  return {screenshot, accessibilityTree};
}

export interface HoverCaptureResult {
  hoverDetected: boolean;
  hoverScreenshot: string | null;
  hoverDetails: string;
}

export async function captureHoverState(
  page: PlaywrightPage
): Promise<HoverCaptureResult> {
  const treeBefore = await page.accessibility.snapshot({
    interestingOnly: false,
  });

  const interactiveSelector = [
    'button',
    'a[href]',
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[role="combobox"]',
    'input:not([type="hidden"])',
    'select',
    '[tabindex="0"]',
  ].join(', ');

  const interactiveLocators = page.locator(interactiveSelector);
  const totalCount = await interactiveLocators.count();
  const testCount = Math.min(totalCount, 5);

  let hoverDetected = false;
  let hoverScreenshot: string | null = null;
  let hoverDetails = '';

  for (let i = 0; i < testCount; i++) {
    const el = interactiveLocators.nth(i);

    try {
      const isVisible = await el.isVisible();
      if (!isVisible) continue;

      await el.hover({timeout: 2000, force: false});
      await page.waitForTimeout(500);

      const treeAfter = await page.accessibility.snapshot({
        interestingOnly: false,
      });
      const newNodes = diffAccessibilityTrees(treeBefore, treeAfter);

      if (newNodes.length > 0) {
        hoverDetected = true;
        hoverScreenshot = (await page.screenshot({type: 'png'})).toString(
          'base64'
        );

        const newNodeDescriptions = newNodes
          .slice(0, 5)
          .map((n) => `${n.role}${n.name ? `: "${n.name}"` : ''}`)
          .join(', ');
        const tagName = await el.evaluate((e: Element) =>
          e.tagName.toLowerCase()
        );
        hoverDetails =
          `Hovering over interactive element ${i} (${tagName}) ` +
          `revealed ${newNodes.length} new accessibility node(s): ${newNodeDescriptions}`;

        break;
      }
    } catch {}
  }

  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);

  return {hoverDetected, hoverScreenshot, hoverDetails};
}

export interface MultiViewportResult {
  reflow: {screenshot: string; hasHorizontalScroll: boolean};
  portrait: string;
  landscape: string;
}

export async function captureMultiViewport(
  page: PlaywrightPage
): Promise<MultiViewportResult> {
  // Reflow test - 320px wide (simulates 400% zoom on 1280px display)
  await page.setViewportSize({width: 320, height: 480});
  await page.waitForTimeout(500);
  const reflowScreenshot = (
    await page.screenshot({type: 'png', fullPage: true})
  ).toString('base64');
  const hasHorizontalScroll = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );

  // Portrait
  await page.setViewportSize({width: 375, height: 812});
  await page.waitForTimeout(500);
  const portrait = (
    await page.screenshot({type: 'png', fullPage: true})
  ).toString('base64');

  // Landscape
  await page.setViewportSize({width: 812, height: 375});
  await page.waitForTimeout(500);
  const landscape = (
    await page.screenshot({type: 'png', fullPage: true})
  ).toString('base64');

  // Restore default viewport
  await page.setViewportSize({width: 1024, height: 768});
  await page.waitForTimeout(300);

  return {
    reflow: {screenshot: reflowScreenshot, hasHorizontalScroll},
    portrait,
    landscape,
  };
}
