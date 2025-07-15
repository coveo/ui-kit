import {expect, test} from './fixture';

test.describe('AtomicCommerceQuerySummary', () => {
  test.describe('when search yields multiple products', () => {
    test.beforeEach(async ({querySummary}) => {
      await querySummary.load({story: 'with-a-fixed-number-of-products'});
    });

    test('screen readers should read out', async ({querySummary}) => {
      const textRegex = /Products 1-27 of [\d,]+/;
      await expect(querySummary.ariaLive(textRegex)).toBeVisible();
    });
  });

  test.describe('when a query yield a single product', () => {
    test.beforeEach(async ({querySummary, searchBox, page}) => {
      await page.route('**/commerce/v2/search', async (route) => {
        const response = await route.fetch();
        const body = await response.json();
        body.products = [body.products[0]];
        body.pagination.totalEntries = 1;
        body.pagination.totalPages = 1;
        await route.fulfill({
          response,
          json: body,
        });
      });
      await querySummary.load({story: 'with-search-box'});
      await searchBox.hydrated.waitFor();
      await searchBox.searchInput.fill('kayak');
      await searchBox.submitButton.click();
    });

    test('should display message', async ({querySummary}) => {
      const textRegex = /^Product 1 of 1 for kayak$/;
      await expect(querySummary.text(textRegex)).toBeVisible();
    });

    test('screen readers should read out', async ({querySummary}) => {
      const textRegex = /^Product 1 of 1 for kayak$/;
      await expect(querySummary.ariaLive(textRegex)).toBeVisible();
    });
  });
});
