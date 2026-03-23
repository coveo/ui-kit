import {expect, type Page} from '@playwright/test';

const numResults = 10;
const numResultsMsg = `Rendered page with ${numResults} results`;
const msgSelector = '#hydrated-msg';
const timestampSelector = '#timestamp';
const resultListSelector = '.result-list li';
const searchBoxSelector = '.search-box input';

async function waitForHydration(page: Page) {
  await expect(page.locator('#hydrated-indicator')).toBeChecked();
}

async function getResultTitles(page: Page) {
  const items = page.locator('.result-list li');
  return items.allInnerTexts();
}

async function parseSSRResponse(
  page: Page,
  url: string
): Promise<{ssrPage: Page}> {
  const response = await page.request.get(url);
  const body = await response.text();
  const context = page.context();
  const ssrPage = await context.newPage();
  await ssrPage.setContent(body);
  return {ssrPage};
}

export {
  expect,
  numResults,
  numResultsMsg,
  msgSelector,
  timestampSelector,
  resultListSelector,
  searchBoxSelector,
  waitForHydration,
  getResultTitles,
  parseSSRResponse,
};
