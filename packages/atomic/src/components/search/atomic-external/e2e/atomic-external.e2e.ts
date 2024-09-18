import {test, expect} from '@playwright/test';

test.describe('External Test Suite', () => {
  test.describe('when modifying state of a component (search box) that is a child of an atomic-external component', () => {
    test.beforeEach(async ({page}) => {
      await page.goto('http://localhost:3333/examples/external.html');

      const searchBox = page.locator('atomic-external > atomic-search-box');
      await searchBox
        .locator('[part="textarea"]')
        .fill('hello', {timeout: 1000});

      await searchBox.press('Enter');
    });

    test("other components' state under the same atomic-external should be affected", async ({
      page,
    }) => {
      const querySummary = page.locator(
        'atomic-external > atomic-query-summary'
      );
      await expect(querySummary).toHaveText(/hello/);
    });

    test("other components' state under the linked atomic-search-interface should be affected", async ({
      page,
    }) => {
      const querySummary = page.locator(
        'atomic-search-interface#interface-2 > atomic-query-summary'
      );
      await expect(querySummary).toHaveText(/hello/);
    });

    test("other components' state under a different atomic-search-interface should not be affected", async ({
      page,
    }) => {
      const querySummary = page.locator(
        'atomic-search-interface#interface-1 > atomic-query-summary'
      );
      await expect(querySummary).not.toHaveText(/hello/);
    });
  });
});
