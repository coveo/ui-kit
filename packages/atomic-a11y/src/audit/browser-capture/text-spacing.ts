/**
 * WCAG 1.4.12 text spacing test capture.
 */

import type {Page} from 'playwright';

/** Text spacing test result. */
export interface TextSpacingResult {
  /** Base64-encoded screenshot with WCAG text spacing applied. */
  textSpacingScreenshot: string;
}

/**
 * Applies WCAG 1.4.12 text spacing requirements and captures a screenshot.
 *
 * Applies line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em,
 * and paragraph spacing 2em to test content reflow without loss of information.
 *
 * @param page - Playwright page instance
 * @returns Screenshot with text spacing applied
 */
export async function captureTextSpacing(
  page: Page
): Promise<TextSpacingResult> {
  try {
    await page.evaluate(() => {
      function applySpacing(root: Document | ShadowRoot) {
        root.querySelectorAll('*').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.lineHeight = '1.5';
          htmlEl.style.letterSpacing = '0.12em';
          htmlEl.style.wordSpacing = '0.16em';
          htmlEl.style.setProperty('margin-bottom', '2em', 'important');
          if (htmlEl.shadowRoot) applySpacing(htmlEl.shadowRoot);
        });
      }
      applySpacing(document);
    });
    await page.waitForTimeout(500);

    const textSpacingScreenshot = (
      await page.screenshot({type: 'png', fullPage: true})
    ).toString('base64');

    await page.reload({waitUntil: 'networkidle'});
    await page.waitForTimeout(1000);

    return {textSpacingScreenshot};
  } catch (error) {
    console.warn('[browser-capture] captureTextSpacing failed:', error);
    return {textSpacingScreenshot: ''};
  }
}
