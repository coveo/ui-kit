import {expect, test} from './fixture';

test.describe('atomic-commerce-interface', () => {
  test.describe('when a query is performed automatically', () => {
    test.beforeEach(async ({commerceInterface}) => {
      await commerceInterface.load({
        story: 'with-product-list',
      });
    });

    test.describe('when a language is provided', () => {
      test('should set the language of the interface', async ({
        commerceInterface,
      }) => {
        await commerceInterface.load({
          story: 'with-product-list',
          args: {language: 'fr'},
        });
        await expect(
          commerceInterface.searchBox().getByPlaceholder('Recherche')
        ).toBeVisible();
      });
    });

    test.describe('when selecting a facet value', () => {
      test.describe('when reflectStateInUrl is true', () => {
        test('should update the url', async ({page, commerceInterface}) => {
          const facetValueLabel = commerceInterface.getFacetValue('Nike');

          await facetValueLabel.click();

          await page.waitForURL(
            '**/iframe.html?id=atomic-commerce-interface--with-product-list*'
          );

          const currentUrl = page.url();

          expect(currentUrl).toContain('Nike');
        });
      });
    });
  });
});
