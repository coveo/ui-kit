/**
 * Default viewport screenshot and accessibility snapshot capture.
 */

import type {Page} from 'playwright';

/** Screenshot and accessibility snapshot capture result. */
export interface CaptureResult {
  /** Base64-encoded PNG screenshot. */
  screenshot: string;
  /** ARIA snapshot in YAML format, or empty string if unavailable. */
  accessibilityTree: string;
}

/**
 * Captures a screenshot and ARIA snapshot at the default viewport size.
 *
 * Uses Playwright's `ariaSnapshot()` to produce a compact YAML representation
 * of the accessibility tree, replacing the deprecated `page.accessibility.snapshot()`.
 *
 * @param page - Playwright page instance
 * @returns Screenshot and accessibility tree data
 */
export async function captureDefaultViewport(
  page: Page
): Promise<CaptureResult> {
  await page.setViewportSize({width: 1024, height: 768});
  await page.waitForTimeout(300);

  const screenshot = (
    await page.screenshot({type: 'png', fullPage: true})
  ).toString('base64');
  const accessibilityTree = await page.locator('body').ariaSnapshot();

  return {screenshot, accessibilityTree};
}
