import {test} from '@playwright/test';
import {
  expect,
  getResultTitles,
  msgSelector,
  numResults,
  numResultsMsg,
  parseSSRResponse,
  resultListSelector,
  searchBoxSelector,
  timestampSelector,
  waitForHydration,
} from './search.fixture';

const routes = ['generic', 'react'] as const;

for (const route of routes) {
  test.describe(`${route} Headless SSR utils`, () => {
    test('renders page in SSR as expected', async ({page}) => {
      const {ssrPage} = await parseSSRResponse(page, `/${route}`);
      await expect(ssrPage.locator(msgSelector)).toHaveText(numResultsMsg);
      await expect(ssrPage.locator(resultListSelector)).toHaveCount(numResults);
      await ssrPage.close();
    });

    test('renders page in CSR as expected', async ({page}) => {
      await page.goto(`/${route}`);
      await expect(page.locator(msgSelector)).toHaveText(numResultsMsg);
      await expect(page.locator(resultListSelector)).toHaveCount(numResults);
    });

    test('renders result list in SSR and then in CSR', async ({page}) => {
      const {ssrPage} = await parseSSRResponse(page, `/${route}`);
      const ssrTimestampText = await ssrPage
        .locator(timestampSelector)
        .innerText();
      const ssrTimestamp = Date.parse(ssrTimestampText);
      expect(ssrTimestamp).not.toBeNaN();
      await ssrPage.close();

      await page.goto(`/${route}`);
      await waitForHydration(page);
      await expect(page.locator(timestampSelector)).not.toBeEmpty();
      const hydratedTimestampText = await page
        .locator(timestampSelector)
        .innerText();
      const hydratedTimestamp = Date.parse(hydratedTimestampText);
      expect(hydratedTimestamp).toBeGreaterThan(ssrTimestamp);
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

      await page.goto(`/${route}`);
      await waitForHydration(page);
      await page.waitForTimeout(1000);

      expect(errors).toHaveLength(0);
      expect(warnings).toHaveLength(0);
    });

    test('after submitting a query, should change search results', async ({
      page,
    }) => {
      const initialResults = await getResultTitles(page);
      expect(initialResults.length).toBe(numResults);

      await page.locator(searchBoxSelector).focus();
      await page.locator(searchBoxSelector).fill('abc');
      await page.locator(searchBoxSelector).press('Enter');
      await page.waitForTimeout(1000);

      const updatedResults = await getResultTitles(page);
      expect(updatedResults.length).toBe(numResults);
      expect(updatedResults).not.toEqual(initialResults);
    });
  });
}
