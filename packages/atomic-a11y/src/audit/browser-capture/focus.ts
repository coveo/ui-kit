/**
 * Keyboard focus navigation testing.
 */

import type {Page} from 'playwright';

/** Focus navigation test results. */
export interface FocusCaptureResult {
  /** Screenshots captured at each focus position. */
  focusScreenshots: string[];
  /** Description of focus navigation path. */
  focusDetails: string;
  /** Whether any focusable elements were found. */
  hasFocusableElements: boolean;
}

/**
 * Tests keyboard focus navigation by tabbing through the component.
 *
 * Captures screenshots at each focus position to verify focus visibility
 * (WCAG 2.4.7) and logical focus order (WCAG 2.4.3).
 *
 * @param page - Playwright page instance
 * @returns Focus navigation results with screenshots
 */
export async function captureFocusStates(
  page: Page
): Promise<FocusCaptureResult> {
  try {
    await page.mouse.click(0, 0);
    await page.waitForTimeout(300);

    const initialTag = await page.evaluate(
      () => document.activeElement?.tagName || 'BODY'
    );

    const focusScreenshots: string[] = [];
    const focusSteps: string[] = [];
    let focusMoved = false;

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      const currentTag = await page.evaluate(() => {
        const ae = document.activeElement;
        return (
          ae?.shadowRoot?.activeElement?.tagName || ae?.tagName || 'unknown'
        );
      });

      if (i === 0 && currentTag === initialTag) {
        await page.mouse.click(0, 0);
        await page.waitForTimeout(300);
        return {
          focusScreenshots: [],
          focusDetails: 'No focusable elements detected',
          hasFocusableElements: false,
        };
      }

      focusMoved = true;
      const screenshot = (await page.screenshot({type: 'png'})).toString(
        'base64'
      );
      focusScreenshots.push(screenshot);
      focusSteps.push(`Tab ${i + 1}: ${currentTag}`);
    }

    await page.mouse.click(0, 0);
    await page.waitForTimeout(300);

    return {
      focusScreenshots,
      focusDetails: focusSteps.join(', '),
      hasFocusableElements: focusMoved,
    };
  } catch (error) {
    console.warn('[browser-capture] captureFocusStates failed:', error);
    return {
      focusScreenshots: [],
      focusDetails: 'Focus capture failed',
      hasFocusableElements: false,
    };
  }
}
