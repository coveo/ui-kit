import {MockCommerceApi} from '@coveo/platform-mock-api';
import {commercePaginationTransformer} from '@coveo/platform-mock-api/commerce/pagination-transformer';
import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {test as base, expect} from '@playwright/test';

interface Fixtures {
  network: NetworkFixture;
}

const commerceApi = new MockCommerceApi();
// Reflect the requested page/perPage in listing responses so that more than one
// page is available (the base response only has a single page) and so that the
// selected page persists across the refetches the pager triggers.
commerceApi.productListingEndpoint.addRequestTransformer(
  commercePaginationTransformer
);

const test = base.extend<Fixtures>({
  network: [
    async ({context}, use) => {
      const network = defineNetworkFixture({
        context,
        handlers: [...commerceApi.handlers],
      });
      await network.enable();
      await use(network);
      await network.disable();
    },
    {auto: true},
  ],
});

test.describe('Pagination', () => {
  test('keeps the selected page selected after clicking it', async ({page}) => {
    await page.goto('/listing/surf-accessories');

    const secondPageInput = page.locator('#page-2');
    await expect(secondPageInput).toBeVisible();
    await expect(secondPageInput).not.toBeChecked();

    await page.locator('label[for="page-2"]').click();

    // Let every refetch the selection triggers settle. The bug caused the page
    // to snap back to the first page once these requests completed.
    await page.waitForLoadState('networkidle');

    await expect(secondPageInput).toBeChecked();
    await expect(page.locator('#page-1')).not.toBeChecked();
  });
});
