import {test, expect} from './fixture';

test.describe('External Test Suite', () => {
  test.describe('when modifying state of a component (search box) that is a child of an atomic-external component', () => {
    test.beforeEach(async ({external}) => {
      await external.load();

      await external.searchBox
        .locator('[part="textarea"]')
        .fill('hello', {timeout: 1000});

      await external.searchBox.press('Enter');
    });

    test("other components' state under the same atomic-external should be affected", async ({
      external,
    }) => {
      await expect(external.querySummary).toHaveText(/hello/);
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
