import {expect, test} from './fixture';

const testCases = [
  {mode: 'product-listing', story: 'with-product-list', facetBrand: 'NRS'},
  {mode: 'search', story: 'with-search', facetBrand: 'Nike'},
] as const;

testCases.forEach(({mode, story, facetBrand}) => {
  test.describe(`atomic-commerce-interface (${mode} mode)`, () => {
    test('should render products', async ({commerceInterface}) => {
      await commerceInterface.load({story});
      await expect(
        commerceInterface
          .productList()
          .locator('atomic-product-section-name')
          .first()
      ).toBeVisible();
    });

    test('should set language when provided', async ({commerceInterface}) => {
      await commerceInterface.load({
        story,
        args: {language: 'fr'},
      });
      await commerceInterface.searchBox().waitFor({state: 'visible'});
      await expect(
        commerceInterface.searchBox().getByPlaceholder('Recherche')
      ).toBeVisible({timeout: 10000});
    });

    test('should reflect state in URL when facet selected', async ({
      page,
      commerceInterface,
    }) => {
      await commerceInterface.load({story});
      const facetValueLabel = commerceInterface.getFacetValue(facetBrand);

      await facetValueLabel.click();

      await page.waitForURL(
        `**/iframe.html?id=atomic-commerce-interface--${story}*`
      );

      await expect(page).toHaveURL(new RegExp(facetBrand));
    });
  });
});
