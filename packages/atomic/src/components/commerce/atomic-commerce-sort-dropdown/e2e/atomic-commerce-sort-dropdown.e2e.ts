import {expect, test} from './fixture';

test.describe('atomic-commerce-sort-dropdown', () => {
  test.beforeEach(async ({commerceSortDropdown}) => {
    await commerceSortDropdown.load();
  });

  test.describe('when selecting a relevance sort criterion', async () => {
    test.beforeEach(async ({commerceSortDropdown}) => {
      await commerceSortDropdown.select.selectOption('relevance');
    });

    test('should reflect relevance sortCriteria in the URL', async ({page}) => {
      expect(page.url()).toContain('sortCriteria=relevance');
    });
  });

  test.describe('when selecting a price sort criterion', async () => {
    test.beforeEach(async ({commerceSortDropdown}) => {
      await commerceSortDropdown.select.selectOption('Price (Low to High)');
    });

    test('should update the select state', async ({commerceSortDropdown}) => {
      expect(await commerceSortDropdown.select.inputValue()).toBe(
        'Price (Low to High)'
      );
    });

    test('should reflect price sortCriteria in the URL', async ({page}) => {
      expect(page.url()).toContain('sortCriteria=ec_price%20asc');
    });
  });
});
