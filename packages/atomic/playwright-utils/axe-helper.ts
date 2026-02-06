import AxeBuilder from '@axe-core/playwright';
import type {Page} from '@playwright/test';
import type {AxeResults} from 'axe-core';

/**
 * Viewport configurations for accessibility testing
 */
export const A11Y_VIEWPORTS = {
  desktop: {width: 1280, height: 720},
  mobile: {width: 375, height: 667},
} as const;

export type ViewportName = keyof typeof A11Y_VIEWPORTS;

export interface AxeScanOptions {
  /**
   * Viewport to test. If provided, the page will be resized before scanning.
   */
  viewport?: {width: number; height: number} | ViewportName;
  /**
   * Additional axe-core rule tags to include (beyond WCAG 2.2 AA defaults)
   */
  additionalTags?: string[];
  /**
   * axe-core rule IDs to disable for this scan
   */
  disabledRules?: string[];
}

/**
 * Scans a page for accessibility violations using axe-core with WCAG 2.2 AA standards.
 *
 * @param page - Playwright Page instance
 * @param options - Configuration options for the accessibility scan
 * @returns axe-core analysis results
 *
 * @example
 * ```typescript
 * // Desktop scan with default viewport
 * const results = await scanPageAccessibility(page, { viewport: 'desktop' });
 * expect(results.violations).toEqual([]);
 *
 * // Mobile scan with custom viewport
 * const results = await scanPageAccessibility(page, {
 *   viewport: { width: 375, height: 667 }
 * });
 * expect(results.violations).toEqual([]);
 * ```
 */
export async function scanPageAccessibility(
  page: Page,
  options: AxeScanOptions = {}
): Promise<AxeResults> {
  const {viewport, additionalTags = [], disabledRules = []} = options;

  // Set viewport if specified
  if (viewport) {
    const viewportSize =
      typeof viewport === 'string' ? A11Y_VIEWPORTS[viewport] : viewport;
    await page.setViewportSize(viewportSize);
  }

  // Configure axe builder with WCAG 2.2 AA tags
  const tags = [
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
    'wcag22aa',
    ...additionalTags,
  ];

  let builder = new AxeBuilder({page}).withTags(tags);

  // Disable specific rules if requested
  if (disabledRules.length > 0) {
    builder = builder.disableRules(disabledRules);
  }

  return await builder.analyze();
}

/**
 * Scans a page at both desktop and mobile viewports for accessibility violations.
 *
 * @param page - Playwright Page instance
 * @param options - Configuration options (applies to both scans)
 * @returns Object containing results for both desktop and mobile scans
 *
 * @example
 * ```typescript
 * const { desktop, mobile } = await scanPageAccessibilityDualViewport(page);
 * expect(desktop.violations).toEqual([]);
 * expect(mobile.violations).toEqual([]);
 * ```
 */
export async function scanPageAccessibilityDualViewport(
  page: Page,
  options: Omit<AxeScanOptions, 'viewport'> = {}
): Promise<{desktop: AxeResults; mobile: AxeResults}> {
  const desktop = await scanPageAccessibility(page, {
    ...options,
    viewport: 'desktop',
  });

  const mobile = await scanPageAccessibility(page, {
    ...options,
    viewport: 'mobile',
  });

  return {desktop, mobile};
}
