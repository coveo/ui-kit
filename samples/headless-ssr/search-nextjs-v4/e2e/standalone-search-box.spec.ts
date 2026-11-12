import {expect, test} from '@playwright/test';
import {gotoAndHydrate, searchBoxSelector, submitQuery, waitForHydration} from './utils';

test.describe('standalone search box', () => {
  test('sends the query to the React search page, which keeps it once hydrated', async ({page}) => {
    const query = 'abc';
    const searchPageUrl = new RegExp(`/react\\?q=${query}$`);
    await gotoAndHydrate(page, '/');

    await submitQuery(page, query);
    await expect(page).toHaveURL(searchPageUrl);
    await waitForHydration(page);
    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(searchPageUrl);
    await expect(page.locator(searchBoxSelector)).toHaveValue(query);
  });
});
