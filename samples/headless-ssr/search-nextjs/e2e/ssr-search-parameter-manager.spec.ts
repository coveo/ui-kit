import {test} from '@playwright/test';
import {
  expect,
  getResultTitles,
  parseSSRResponse,
  searchBoxSelector,
  waitForHydration,
} from './search.fixture';

const routes = ['generic', 'react'] as const;

for (const route of routes) {
  test.describe(`${route} Headless ssr with search parameter manager example`, () => {
    test.describe('when loading a page without search parameters, after hydration', () => {
      test.describe('after submitting a search', () => {
        const query = 'abc';

        test('should have the correct search parameters', async ({page}) => {
          await page.goto(`/${route}`);
          await waitForHydration(page);
          const initialResults = await getResultTitles(page);
          expect(initialResults.length).toBeGreaterThan(0);

          await page.waitForTimeout(1000);
          await page.locator(searchBoxSelector).focus();
          await page.locator(searchBoxSelector).fill(query);
          await page.locator(searchBoxSelector).press('Enter');

          await expect(page).toHaveURL((url) => url.searchParams.has('q'));

          const url = new URL(page.url());
          expect(url.searchParams.get('q')).toBe(query);
        });

        test('has only two history states', async ({page}) => {
          await page.goto(`/${route}`);
          await waitForHydration(page);

          await page.waitForTimeout(1000);
          await page.locator(searchBoxSelector).focus();
          await page.locator(searchBoxSelector).fill(query);
          await page.locator(searchBoxSelector).press('Enter');

          await expect(page).toHaveURL((url) => url.searchParams.has('q'));

          await page.goBack();
          await page.goBack();
          expect(page.url()).toBe('about:blank');
        });

        test.describe('after pressing the back button', () => {
          test('should remove the search parameters', async ({page}) => {
            await page.goto(`/${route}`);
            await waitForHydration(page);

            await page.waitForTimeout(1000);
            await page.locator(searchBoxSelector).focus();
            await page.locator(searchBoxSelector).fill(query);
            await page.locator(searchBoxSelector).press('Enter');

            await expect(page).toHaveURL((url) => url.searchParams.has('q'));

            await page.goBack();

            const url = new URL(page.url());
            expect(url.searchParams.size).toBe(0);
          });

          test('should update the page', async ({page}) => {
            await page.goto(`/${route}`);
            await waitForHydration(page);
            const initialResults = await getResultTitles(page);

            await page.waitForTimeout(1000);
            await page.locator(searchBoxSelector).focus();
            await page.locator(searchBoxSelector).fill(query);
            await page.locator(searchBoxSelector).press('Enter');

            await expect(page).toHaveURL((url) => url.searchParams.has('q'));

            await page.goBack();

            await expect(page.locator(searchBoxSelector)).toHaveValue('');
            const restoredResults = await getResultTitles(page);
            expect(restoredResults).toEqual(initialResults);
          });

          test('should not log an error nor warning', async ({page}) => {
            const errors: string[] = [];
            const warnings: string[] = [];
            page.on('console', (msg) => {
              if (msg.type() === 'error') errors.push(msg.text());
              if (msg.type() === 'warning') warnings.push(msg.text());
            });

            await page.goto(`/${route}`);
            await waitForHydration(page);

            await page.waitForTimeout(1000);
            await page.locator(searchBoxSelector).focus();
            await page.locator(searchBoxSelector).fill(query);
            await page.locator(searchBoxSelector).press('Enter');

            await expect(page).toHaveURL((url) => url.searchParams.has('q'));

            await page.goBack();

            expect(errors).toHaveLength(0);
            expect(warnings).toHaveLength(0);
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
        const {ssrPage} = await parseSSRResponse(page, getInitialUrl());
        await expect(ssrPage.locator(searchBoxSelector)).toHaveValue(query);
        await ssrPage.close();
      });

      test.describe('after hydration', () => {
        test("doesn't update the page", async ({page}) => {
          await page.goto(getInitialUrl());
          await waitForHydration(page);
          await page.waitForTimeout(1000);
          await expect(page.locator(searchBoxSelector)).toHaveValue(query);
        });

        test('should not update the parameters', async ({page}) => {
          await page.goto(getInitialUrl());
          await waitForHydration(page);
          await page.waitForTimeout(1000);

          const url = new URL(page.url());
          expect(url.searchParams.size).toBe(3);
          expect(url.searchParams.get('q')).toBe(query);
          expect(url.searchParams.get('foo')).toBe('bar');
          expect(url.searchParams.get('tab')).toBe('videos');
        });

        test('has only one history state', async ({page}) => {
          await page.goto(getInitialUrl());
          await waitForHydration(page);

          await page.goBack();
          expect(page.url()).toBe('about:blank');
        });
      });
    });

    test.describe('when loading a page with invalid search parameters', () => {
      function getInitialUrl() {
        return `/${route}?q=`;
      }

      test('renders page in SSR as expected', async ({page}) => {
        const {ssrPage} = await parseSSRResponse(page, getInitialUrl());
        await expect(ssrPage.locator(searchBoxSelector)).toHaveValue('');
        await ssrPage.close();
      });

      test.describe('after hydration', () => {
        test("doesn't update the page", async ({page}) => {
          await page.goto(getInitialUrl());
          await waitForHydration(page);
          await page.waitForTimeout(1000);
          await expect(page.locator(searchBoxSelector)).toHaveValue('');
        });

        test('has only two history states', async ({page}) => {
          await page.goto(getInitialUrl());
          await waitForHydration(page);

          await page.goBack();
          expect(page.url()).toBe('about:blank');
        });
      });
    });
  });
}
