import {expect, test} from '@playwright/test';
import {getResultTitles, searchBoxSelector, waitForHydration} from './utils';

const baseURL = 'http://localhost:3000';
const routes = ['generic', 'react'] as const;

routes.forEach((route) => {
  test.describe(`${route} Headless ssr with search parameter manager example`, () => {
    test.describe('when loading a page without search parameters, after hydration', () => {
      let initialResults: string[];
      let historyLengthAfterGoto: number;

      test.beforeEach(async ({page}) => {
        await page.goto(`/${route}`);
        historyLengthAfterGoto = await page.evaluate(
          () => window.history.length
        );
        await waitForHydration(page);
        initialResults = await getResultTitles(page);
        expect(initialResults.length).toBeGreaterThan(0);
      });

      test.describe('after submitting a search', () => {
        const query = 'abc';

        test.beforeEach(async ({page}) => {
          await page.waitForTimeout(1000);
          await page.locator(searchBoxSelector).focus();
          await page.locator(searchBoxSelector).fill(query);
          await page.locator(searchBoxSelector).press('Enter');

          await expect(page).toHaveURL(/[?&]q=/);
          await expect
            .poll(async () => getResultTitles(page), {timeout: 10000})
            .not.toEqual(initialResults);
        });

        test('should have the correct search parameters', async ({page}) => {
          const url = new URL(page.url());
          expect(url.searchParams.get('q')).toBe(query);
        });

        test('has only two history states', async ({page}) => {
          // goto + search pushState = historyLengthAfterGoto + 1
          const historyLength = await page.evaluate(
            () => window.history.length
          );
          expect(historyLength).toBe(historyLengthAfterGoto + 1);
        });

        test.describe('after pressing the back button', () => {
          test.beforeEach(async ({page}) => {
            await page.goBack();
          });

          test('should remove the search parameters', async ({page}) => {
            const url = new URL(page.url());
            expect(url.searchParams.size).toBe(0);
          });

          test('should update the page', async ({page}) => {
            await expect(page.locator(searchBoxSelector)).toHaveValue('');
            const currentResults = await getResultTitles(page);
            expect(currentResults.length).toBe(initialResults.length);
          });

          test('should not log an error nor warning', async ({page}) => {
            const errors: string[] = [];
            const warnings: string[] = [];
            page.on('console', (msg) => {
              if (msg.type() === 'error') errors.push(msg.text());
              if (msg.type() === 'warning') warnings.push(msg.text());
            });
            await page.waitForTimeout(1000);
            expect(errors).toEqual([]);
            expect(warnings).toEqual([]);
          });
        });
      });
    });

    test.describe('when loading a page with search parameters', () => {
      const query = 'def';
      function getInitialUrl() {
        return `/${route}?q=${query}&foo=bar&tab=videos`;
      }

      test('renders page in SSR as expected', async ({page}) => {
        const response = await fetch(`${baseURL}${getInitialUrl()}`);
        const html = await response.text();

        const valueMatch = html.match(
          /class="search-box"[^>]*>[\s\S]*?<input[^>]*value="([^"]*)"/
        );
        expect(valueMatch?.[1] ?? '').toBe(query);

        await page.goto(getInitialUrl());
        await waitForHydration(page);
      });

      test.describe('after hydration', () => {
        let historyLengthAfterGoto: number;

        test.beforeEach(async ({page}) => {
          await page.goto(getInitialUrl());
          historyLengthAfterGoto = await page.evaluate(
            () => window.history.length
          );
          await waitForHydration(page);
        });

        test("doesn't update the page", async ({page}) => {
          await page.waitForTimeout(1000);
          await expect(page.locator(searchBoxSelector)).toHaveValue(query);
        });

        test('should not update the parameters', async ({page}) => {
          await page.waitForTimeout(1000);
          const url = new URL(page.url());
          expect(url.searchParams.size).toBe(3);
          expect(url.searchParams.get('q')).toBe(query);
          expect(url.searchParams.get('foo')).toBe('bar');
          expect(url.searchParams.get('tab')).toBe('videos');
        });

        test('has only one history state', async ({page}) => {
          // No additional history entries should be added during hydration
          const historyLength = await page.evaluate(
            () => window.history.length
          );
          expect(historyLength).toBe(historyLengthAfterGoto);
        });
      });
    });

    test.describe('when loading a page with invalid search parameters', () => {
      function getInitialUrl() {
        return `/${route}?q=`;
      }

      test('renders page in SSR as expected', async ({page}) => {
        const response = await fetch(`${baseURL}${getInitialUrl()}`);
        const html = await response.text();

        const valueMatch = html.match(
          /class="search-box"[^>]*>[\s\S]*?<input[^>]*value="([^"]*)"/
        );
        expect(valueMatch?.[1] ?? '').toBe('');

        await page.goto(getInitialUrl());
        await waitForHydration(page);
      });

      test.describe('after hydration', () => {
        let historyLengthAfterGoto: number;

        test.beforeEach(async ({page}) => {
          await page.goto(getInitialUrl());
          historyLengthAfterGoto = await page.evaluate(
            () => window.history.length
          );
          await waitForHydration(page);
        });

        test("doesn't update the page", async ({page}) => {
          await page.waitForTimeout(1000);
          await expect(page.locator(searchBoxSelector)).toHaveValue('');
        });

        test('has only two history states', async ({page}) => {
          // Invalid params should be cleaned via replaceState, not pushState
          const historyLength = await page.evaluate(
            () => window.history.length
          );
          expect(historyLength).toBe(historyLengthAfterGoto);
        });
      });
    });
  });
});
