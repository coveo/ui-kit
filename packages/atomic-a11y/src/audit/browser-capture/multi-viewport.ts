/**
 * Multi-viewport responsive screenshot capture.
 */

import type {Page} from 'playwright';

/** Screenshots captured at multiple viewport sizes. */
export interface MultiViewportResult {
  /** Reflow test at 320px width (simulates 400% zoom). */
  reflow: {screenshot: string; hasHorizontalScroll: boolean};
  /** Portrait mobile screenshot (375x812). */
  portrait: string;
  /** Landscape mobile screenshot (812x375). */
  landscape: string;
}

/**
 * Captures screenshots at multiple viewport sizes for responsive testing.
 *
 * Tests WCAG 1.4.10 Reflow by checking for horizontal scrolling at 320px width,
 * and captures portrait/landscape mobile views.
 *
 * @param page - Playwright page instance
 * @returns Screenshots and reflow test results
 */
export async function captureMultiViewport(
  page: Page
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
