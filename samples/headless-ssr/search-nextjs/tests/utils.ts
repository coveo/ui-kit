import {type Page, expect} from '@playwright/test';

export const numResults = 10;

export const msgSelector = '#hydrated-msg';
export const timestampSelector = '#timestamp';
export const resultListSelector = '.result-list li';
export const searchBoxSelector = '.search-box input';

export async function waitForHydration(page: Page) {
  await expect(page.locator('#hydrated-indicator')).toBeChecked();
}

export async function getResultTitles(page: Page): Promise<string[]> {
  const items = page.locator('.result-list li');
  await items.first().waitFor();
  return items.allInnerTexts();
}
