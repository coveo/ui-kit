/**
 * Hover state detection for interactive elements.
 */

import type {Locator, Page} from 'playwright';

/** ARIA roles considered interactive for hover testing. */
const INTERACTIVE_ROLES = [
  'button',
  'link',
  'textbox',
  'combobox',
  'tab',
  'menuitem',
  'checkbox',
  'radio',
  'switch',
  'slider',
] as const;

/**
 * Collects all interactive elements across multiple ARIA roles into a
 * single list of locators, limited to the first {@link limit} visible items.
 */
async function collectInteractiveLocators(
  page: Page,
  limit: number
): Promise<Locator[]> {
  const locators: Locator[] = [];
  for (const role of INTERACTIVE_ROLES) {
    if (locators.length >= limit) break;
    const roleLocator = page.getByRole(role);
    const count = await roleLocator.count();
    for (let i = 0; i < count && locators.length < limit; i++) {
      locators.push(roleLocator.nth(i));
    }
  }
  return locators;
}

/** Result from hover state detection. */
export interface HoverCaptureResult {
  /** Whether any hover state changes were detected. */
  hoverDetected: boolean;
  /** Base64-encoded screenshot showing hover state, or null if none detected. */
  hoverScreenshot: string | null;
  /** Description of detected hover state changes. */
  hoverDetails: string;
}

/**
 * Tests interactive elements for hover-triggered accessibility tree changes.
 *
 * Hovers over up to 5 focusable elements and compares ARIA snapshots
 * before and after to detect new content (e.g., tooltips, dropdowns).
 *
 * @param page - Playwright page instance
 * @returns Hover detection results with optional screenshot
 */
export async function captureHoverState(
  page: Page
): Promise<HoverCaptureResult> {
  const snapshotBefore = await page.locator('body').ariaSnapshot();

  const elements = await collectInteractiveLocators(page, 5);

  let hoverDetected = false;
  let hoverScreenshot: string | null = null;
  let hoverDetails = '';

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];

    try {
      const isVisible = await el.isVisible();
      if (!isVisible) continue;

      await el.hover({timeout: 2000, force: false});
      await page.waitForTimeout(500);

      const snapshotAfter = await page.locator('body').ariaSnapshot();

      if (snapshotAfter !== snapshotBefore) {
        hoverDetected = true;
        hoverScreenshot = (await page.screenshot({type: 'png'})).toString(
          'base64'
        );

        const tagName = await el.evaluate((e: Element) =>
          e.tagName.toLowerCase()
        );
        hoverDetails =
          `Hovering over interactive element ${i} (${tagName}) ` +
          'revealed accessibility tree changes on hover.';

        break;
      }
    } catch (error) {
      console.warn(
        '[browser-capture] captureHoverState element hover failed:',
        error
      );
    }
  }

  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);

  return {hoverDetected, hoverScreenshot, hoverDetails};
}
