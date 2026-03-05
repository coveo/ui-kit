/**
 * WCAG 2.5.8 target size measurement.
 */

import type {Page} from 'playwright';

/** ARIA roles considered interactive for target size testing. */
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

/** Target size measurement result. */
export interface TargetSizeResult {
  /** Description of interactive element sizes. */
  targetSizeData: string;
  /** Screenshot for visual verification. */
  targetSizeScreenshot: string;
}

/**
 * Measures interactive element target sizes for WCAG 2.5.8 compliance.
 *
 * Uses Playwright's `getByRole()` to locate interactive elements via the
 * accessibility tree, then measures their bounding boxes to verify the
 * minimum 24x24px target size requirement.
 *
 * @param page - Playwright page instance
 * @returns Element size data and screenshot
 */
export async function captureTargetSizes(
  page: Page
): Promise<TargetSizeResult> {
  try {
    const measurements: {
      tag: string;
      width: number;
      height: number;
      text: string;
    }[] = [];

    for (const role of INTERACTIVE_ROLES) {
      const locator = page.getByRole(role);
      const count = await locator.count();

      for (let i = 0; i < count; i++) {
        const el = locator.nth(i);
        const box = await el.boundingBox();
        if (!box || box.width === 0 || box.height === 0) continue;

        const text = ((await el.textContent()) ?? '').trim().slice(0, 30);
        const tag = await el.evaluate((e: Element) => e.tagName.toLowerCase());

        measurements.push({
          tag,
          width: Math.round(box.width),
          height: Math.round(box.height),
          text,
        });
      }
    }

    const targetSizeData =
      measurements.length > 0
        ? 'Interactive elements: ' +
          measurements
            .map((e) => `${e.tag} '${e.text}' ${e.width}x${e.height}px`)
            .join(', ')
        : 'No interactive elements found';

    const targetSizeScreenshot = (
      await page.screenshot({type: 'png'})
    ).toString('base64');

    return {targetSizeData, targetSizeScreenshot};
  } catch (error) {
    console.warn('[browser-capture] captureTargetSizes failed:', error);
    return {
      targetSizeData: 'Target size capture failed',
      targetSizeScreenshot: '',
    };
  }
}
