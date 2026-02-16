import {expect, test} from './fixture';

test.describe('atomic-external', () => {
  test.beforeEach(async ({external, page}) => {
    await external.load();
    await external.hydrated.waitFor();
    await page.waitForLoadState('networkidle');
  });

  test.describe('when modifying state of a component (search box) that is a child of an atomic-external component', () => {
    test.beforeEach(async ({external, page}) => {
      await page
        .locator('atomic-external')
        .getByLabel('Search field with suggestions')
        .waitFor({state: 'visible', timeout: 5000});

      await page
        .locator('atomic-external')
        .getByLabel('Search field with suggestions')
        .fill('hello');

      await external.searchBox.press('Enter');

      await page.waitForLoadState('networkidle');
    });

    test('should affect state of other components inside the same atomic-external', async ({
      external,
    }) => {
      await expect(external.querySummary).toHaveText(/hello/);
    });

    test('should affect state of other components inside the linked atomic-search-interface', async ({
      page,
    }) => {
      const querySummary = page.locator(
        'atomic-search-interface[data-interface-id="interface-2"] > atomic-query-summary'
      );
      await expect(querySummary).toHaveText(/hello/);
    });

    test('should not affect state of components under a different atomic-search-interface', async ({
      page,
    }) => {
      const querySummary = page.locator(
        'atomic-search-interface[data-interface-id="interface-1"] > atomic-query-summary'
      );
      await expect(querySummary).not.toHaveText(/hello/);
    });
  });
});
