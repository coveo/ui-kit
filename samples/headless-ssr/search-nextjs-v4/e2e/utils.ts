import {expect, type Page} from '@playwright/test';

export const routes = ['generic', 'react'] as const;
export const numResults = 10;

export const msgSelector = '#hydrated-msg';
export const timestampSelector = '#timestamp';
export const resultListSelector = '.result-list li';
export const searchBoxSelector = '.search-box input';

export async function waitForHydration(page: Page) {
  await expect(page.locator('#hydrated-indicator')).toBeChecked();
}

/**
 * Loads a page and waits until it is hydrated.
 *
 * @returns The length of the history once the page is loaded, before the hydration can change it.
 */
export async function gotoAndHydrate(page: Page, url: string) {
  await page.goto(url);
  const historyLength = await getHistoryLength(page);
  await waitForHydration(page);
  return historyLength;
}

export function getHistoryLength(page: Page) {
  return page.evaluate(() => window.history.length);
}

export async function getResultTitles(page: Page): Promise<string[]> {
  const items = page.locator(resultListSelector);
  await items.first().waitFor();
  return items.allInnerTexts();
}

export async function submitQuery(page: Page, query: string) {
  await page.locator(searchBoxSelector).fill(query);
  await page.locator(searchBoxSelector).press('Enter');
}

export function collectConsoleProblems(page: Page) {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      problems.push(message.text());
    }
  });
  return problems;
}

export function searchBoxValueInHtml(html: string) {
  return html.match(/class="search-box"[^>]*>[\s\S]*?<input[^>]*value="([^"]*)"/)?.[1];
}
