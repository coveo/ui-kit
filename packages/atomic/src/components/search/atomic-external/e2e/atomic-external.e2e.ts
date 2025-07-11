import {expect, test} from './fixture';

test.describe('when modifying state of a component (search box) that is a child of an atomic-external component', () => {
  test.beforeEach(async ({external, page}) => {
    await external.load();
    await external.hydrated.waitFor();

    await page
      .locator('atomic-external')
      .getByLabel('Search field with suggestions')
      .waitFor({state: 'visible', timeout: 5000});

    await page
      .locator('atomic-external')
      .getByLabel('Search field with suggestions')
      .fill('hello');

    await external.searchBox.press('Enter');
  });

  test.fixme(
    "other components' state under the same atomic-external should be affected",
    async ({external}) => {
      await expect(external.querySummary).toHaveText(/hello/);
    }
  );

  test.fixme(
    "other components' state under the linked atomic-search-interface should be affected",
    async ({page}) => {
      const querySummary = page.locator(
        'atomic-search-interface#interface-2 > atomic-query-summary'
      );
      await expect(querySummary).toHaveText(/hello/);
    }
  );

  test.fixme(
    "other components' state under a different atomic-search-interface should not be affected",
    async ({page}) => {
      const querySummary = page.locator(
        'atomic-search-interface#interface-1 > atomic-query-summary'
      );
      await expect(querySummary).not.toHaveText(/hello/);
    }
  );
});
