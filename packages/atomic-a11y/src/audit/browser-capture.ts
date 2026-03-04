/**
 * Browser capture utilities for accessibility auditing.
 *
 * Provides Playwright-based browser automation for capturing screenshots,
 * accessibility trees, and interaction states from Storybook stories.
 */

import {type Browser, chromium, type Page} from 'playwright';
import {
  type AccessibilityNode,
  diffAccessibilityTrees,
} from './accessibility-tree.js';

export type {Browser as PlaywrightBrowser, Page as PlaywrightPage};

/**
 * CSS selectors for interactive elements that should be tested
 * for hover, focus, and target size requirements.
 */
const INTERACTIVE_SELECTORS = [
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
] as const;

/** Combined selector string for querying all interactive elements. */
const INTERACTIVE_SELECTOR = INTERACTIVE_SELECTORS.join(', ');

/** Browser instance and page pool for concurrent auditing. */
export interface BrowserContext {
  browser: Browser;
  pages: Page[];
}

/**
 * Initializes a headless browser with a pool of pages for concurrent auditing.
 *
 * @param concurrency - Number of pages to create for parallel processing
 * @returns Browser context with page pool
 */
export async function initBrowser(
  concurrency: number
): Promise<BrowserContext> {
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

/**
 * Navigates to a Storybook story in iframe mode.
 *
 * @param page - Playwright page instance
 * @param storybookUrl - Base URL of the Storybook instance
 * @param storyId - Story identifier (e.g., "components-button--primary")
 */
export async function navigateToStory(
  page: Page,
  storybookUrl: string,
  storyId: string
): Promise<void> {
  const url = `${storybookUrl}/iframe.html?id=${storyId}&viewMode=story`;
  await page.goto(url, {waitUntil: 'networkidle', timeout: 30000});
  // Wait for component to render
  await page.waitForTimeout(1000);
}

/** Screenshot and accessibility tree capture result. */
export interface CaptureResult {
  /** Base64-encoded PNG screenshot. */
  screenshot: string;
  /** Accessibility tree snapshot, or null if unavailable. */
  accessibilityTree: AccessibilityNode | null;
}

/**
 * Captures a screenshot and accessibility tree at the default viewport size.
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
  const accessibilityTree = await page.accessibility.snapshot({
    interestingOnly: false,
  });

  return {screenshot, accessibilityTree};
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
 * Tests interactive elements for hover state accessibility tree changes.
 *
 * Hovers over up to 5 interactive elements and captures any accessibility
 * tree changes (e.g., tooltips, dropdowns) that appear on hover.
 *
 * @param page - Playwright page instance
 * @returns Hover detection results with optional screenshot
 */
export async function captureHoverState(
  page: Page
): Promise<HoverCaptureResult> {
  const treeBefore = await page.accessibility.snapshot({
    interestingOnly: false,
  });

  const interactiveLocators = page.locator(INTERACTIVE_SELECTOR);
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
 * Collects dimensions of all interactive elements including those in
 * shadow DOM to verify minimum 24x24px target size requirement.
 *
 * @param page - Playwright page instance
 * @returns Element size data and screenshot
 */
export async function captureTargetSizes(
  page: Page
): Promise<TargetSizeResult> {
  try {
    const elements = await page.evaluate((selector: string) => {
      function findInteractive(root: Document | ShadowRoot) {
        const results: {
          tag: string;
          width: number;
          height: number;
          text: string;
        }[] = [];
        root.querySelectorAll(selector).forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            results.push({
              tag: el.tagName.toLowerCase(),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              text: (el.textContent || '').trim().slice(0, 30),
            });
          }
          const htmlEl = el as unknown as {
            shadowRoot: Document | ShadowRoot | null;
          };
          if (htmlEl.shadowRoot)
            results.push(...findInteractive(htmlEl.shadowRoot));
        });
        return results;
      }
      return findInteractive(document);
    }, INTERACTIVE_SELECTOR);

    const targetSizeData =
      elements.length > 0
        ? 'Interactive elements: ' +
          elements
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
