import {expect, test} from '@playwright/test';
import {
  getResultTitles,
  msgSelector,
  numResults,
  resultListSelector,
  searchBoxSelector,
  timestampSelector,
  waitForHydration,
} from './utils';

const numResultsMsg = `Rendered page with ${numResults} results`;
const baseURL = 'http://localhost:3000';

const routes = ['generic', 'react'] as const;

routes.forEach((route) => {
  test.describe(`${route} Headless SSR utils`, () => {
    test('renders page in SSR as expected', async ({page}) => {
      const response = await fetch(`${baseURL}/${route}`);
      expect(response.ok).toBeTruthy();
      const html = await response.text();
      await page.setContent(html, {waitUntil: 'domcontentloaded'});
      await expect(page.locator(msgSelector)).toHaveText(numResultsMsg);
      await expect(page.locator(resultListSelector)).toHaveCount(numResults);
    });

    test('renders page in CSR as expected', async ({page}) => {
      await page.goto(`/${route}`);
      await expect(page.locator(msgSelector)).toHaveText(numResultsMsg);
      const resultItems = page.locator(resultListSelector);
      await expect(resultItems).toHaveCount(numResults);
    });

    test('renders result list in SSR and then in CSR', async ({page}) => {
      const response = await fetch(`${baseURL}/${route}`);
      const html = await response.text();
      const timestampMatch = html.match(/id="timestamp"[^>]*>([^<]+)</);
      expect(timestampMatch).not.toBeNull();
      const ssrTimestamp = Date.parse(timestampMatch![1]);
      expect(ssrTimestamp).not.toBeNaN();

      await page.goto(`/${route}`);
      await expect
        .poll(
          async () => {
            const text = await page.locator(timestampSelector).textContent();
            return text ? Date.parse(text) : NaN;
          },
          {timeout: 10000}
        )
        .toBeGreaterThan(ssrTimestamp);
    });
  });

  test.describe(`${route} Headless SSR utils after hydration`, () => {
    test.beforeEach(async ({page}) => {
      await page.goto(`/${route}`);
      await waitForHydration(page);
    });

    test('should not log any error nor warning', async ({page}) => {
      const errors: string[] = [];
      const warnings: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
        if (msg.type() === 'warning') warnings.push(msg.text());
      });

      await page.reload();
      await waitForHydration(page);
      await page.waitForTimeout(1000);

      expect(errors).toEqual([]);
      expect(warnings).toEqual([]);
    });

    test('after submitting a query, should change search results', async ({
      page,
    }) => {
      const initialResults = await getResultTitles(page);
      expect(initialResults).toHaveLength(numResults);

      await page.locator(searchBoxSelector).focus();
      await page.locator(searchBoxSelector).fill('abc');
      await page.locator(searchBoxSelector).press('Enter');

      await expect
        .poll(async () => getResultTitles(page), {timeout: 10000})
        .not.toEqual(initialResults);
    });
  });
});
