import {expect, test} from '@playwright/test';
import {
  collectConsoleProblems,
  getHistoryLength,
  getResultTitles,
  gotoAndHydrate,
  routes,
  searchBoxSelector,
  searchBoxValueInHtml,
  submitQuery,
} from './utils';

for (const route of routes) {
  test.describe(`${route} search page URL`, () => {
    test.describe('when a query is submitted on a page loaded without search parameters', () => {
      const query = 'abc';
      let initialResults: string[];
      let historyLengthAfterGoto: number;

      test.beforeEach(async ({page}) => {
        historyLengthAfterGoto = await gotoAndHydrate(page, `/${route}`);
        initialResults = await getResultTitles(page);

        await submitQuery(page, query);

        await expect(page).toHaveURL(/[?&]q=/);
        await expect.poll(() => getResultTitles(page)).not.toEqual(initialResults);
      });

      test('holds the query', async ({page}) => {
        expect(new URL(page.url()).searchParams.get('q')).toBe(query);
      });

      test('adds one history entry', async ({page}) => {
        expect(await getHistoryLength(page)).toBe(historyLengthAfterGoto + 1);
      });

      test.describe('after going back', () => {
        let problems: string[];

        test.beforeEach(async ({page}) => {
          problems = collectConsoleProblems(page);
          await page.goBack();
        });

        test('holds no search parameter', async ({page}) => {
          expect(new URL(page.url()).searchParams.size).toBe(0);
        });

        test('restores the page', async ({page}) => {
          await expect(page.locator(searchBoxSelector)).toHaveValue('');
          await expect.poll(() => getResultTitles(page)).toEqual(initialResults);
        });

        test('logs no error nor warning', async ({page}) => {
          await page.waitForTimeout(1000);

          expect(problems).toEqual([]);
        });
      });
    });

    test.describe('when the page is loaded with search parameters', () => {
      const query = 'def';
      const url = `/${route}?q=${query}&foo=bar&tab=videos`;

      test('renders the query on the server', async ({request}) => {
        const html = await (await request.get(url)).text();

        expect(searchBoxValueInHtml(html)).toBe(query);
      });

      test.describe('after hydration', () => {
        let historyLengthAfterGoto: number;

        test.beforeEach(async ({page}) => {
          historyLengthAfterGoto = await gotoAndHydrate(page, url);
          await page.waitForTimeout(1000);
        });

        test('keeps the query', async ({page}) => {
          await expect(page.locator(searchBoxSelector)).toHaveValue(query);
        });

        test('keeps the search parameters', async ({page}) => {
          const {searchParams} = new URL(page.url());
          expect(searchParams.size).toBe(3);
          expect(searchParams.get('q')).toBe(query);
          expect(searchParams.get('foo')).toBe('bar');
          expect(searchParams.get('tab')).toBe('videos');
        });

        test('adds no history entry', async ({page}) => {
          expect(await getHistoryLength(page)).toBe(historyLengthAfterGoto);
        });
      });
    });

    test.describe('when the page is loaded with an empty query', () => {
      const url = `/${route}?q=`;

      test('renders an empty query on the server', async ({request}) => {
        const html = await (await request.get(url)).text();

        expect(searchBoxValueInHtml(html)).toBe('');
      });

      test.describe('after hydration', () => {
        let historyLengthAfterGoto: number;

        test.beforeEach(async ({page}) => {
          historyLengthAfterGoto = await gotoAndHydrate(page, url);
          await page.waitForTimeout(1000);
        });

        test('keeps the query empty', async ({page}) => {
          await expect(page.locator(searchBoxSelector)).toHaveValue('');
        });

        test('removes the empty query from the URL without a history entry', async ({page}) => {
          expect(new URL(page.url()).searchParams.has('q')).toBe(false);
          expect(await getHistoryLength(page)).toBe(historyLengthAfterGoto);
        });
      });
    });
  });
}
