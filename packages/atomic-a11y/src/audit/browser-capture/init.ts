/**
 * Browser initialization and navigation for accessibility auditing.
 */

import {type Browser, chromium, type Page} from 'playwright';

export type {Browser as PlaywrightBrowser, Page as PlaywrightPage};

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
