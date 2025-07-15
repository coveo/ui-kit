import {expect, test} from './fixture';

test.describe('AtomicBreadbox', () => {
  test('should show the breadcrumb as stars for the rating facet', async ({
    breadbox,
  }) => {
    await breadbox.load({story: 'with-rating-facet'});

    await breadbox.ratingFacet.click();

    await expect(breadbox.ratingBreadcrumb).toBeVisible();
    await expect(
      breadbox.ratingBreadcrumb
        .locator('div[part="value-rating"]')
        .locator('atomic-icon')
    ).toHaveCount(10);
  });
});
