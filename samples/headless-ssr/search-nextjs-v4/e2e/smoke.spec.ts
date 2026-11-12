import {expect, test} from '@playwright/test';
import {
  collectConsoleProblems,
  getResultTitles,
  gotoAndHydrate,
  msgSelector,
  numResults,
  resultListSelector,
  routes,
  submitQuery,
  timestampSelector,
  waitForHydration,
} from './utils';

const numResultsMsg = `Rendered page with ${numResults} results`;

const timestampInHtml = (html: string) =>
  Date.parse(html.match(/id="timestamp"[^>]*>([^<]+)</)?.[1] ?? '');

for (const route of routes) {
  test.describe(`${route} search page`, () => {
    test('renders the results on the server', async ({page, request}) => {
      const response = await request.get(`/${route}`);
      expect(response.ok()).toBeTruthy();
      await page.setContent(await response.text(), {waitUntil: 'domcontentloaded'});

      await expect(page.locator(msgSelector)).toHaveText(numResultsMsg);
      await expect(page.locator(resultListSelector)).toHaveCount(numResults);
    });

    test('renders the results in the browser', async ({page}) => {
      await page.goto(`/${route}`);

      await expect(page.locator(msgSelector)).toHaveText(numResultsMsg);
      await expect(page.locator(resultListSelector)).toHaveCount(numResults);
    });

    test('renders again in the browser after the server render', async ({page}) => {
      const response = await page.goto(`/${route}`);
      const ssrTimestamp = timestampInHtml((await response?.text()) ?? '');
      expect(ssrTimestamp).not.toBeNaN();

      await expect
        .poll(async () => Date.parse((await page.locator(timestampSelector).textContent()) ?? ''))
        .toBeGreaterThan(ssrTimestamp);
    });
  });

  test.describe(`${route} search page after hydration`, () => {
    test.beforeEach(async ({page}) => {
      await gotoAndHydrate(page, `/${route}`);
    });

    test('logs no error nor warning', async ({page}) => {
      const problems = collectConsoleProblems(page);

      await page.reload();
      await waitForHydration(page);
      await page.waitForTimeout(1000);

      expect(problems).toEqual([]);
    });

    test('changes the results when a query is submitted', async ({page}) => {
      const initialResults = await getResultTitles(page);

      await submitQuery(page, 'abc');

      await expect.poll(() => getResultTitles(page)).not.toEqual(initialResults);
    });
  });
}
