/* eslint-disable @cspell/spellchecker */
import {AtomicCommerceRecommendationInterface} from '../atomic-commerce-recommendation-interface';
import {test, expect} from './fixture';

// TODO: fix these tests for recommendation interface.

test.describe('AtomicCommerceRecommendationInterface', () => {
  test.describe('when a query is performed automatically', () => {
    test.beforeEach(async ({commerceRecommendationInterface}) => {
      await commerceRecommendationInterface.load({
        story: 'with-product-list',
      });
    });

    test.describe('when a language is provided', () => {
      test('should set the language of the interface', async ({
        commerceRecommendationInterface,
      }) => {
        await commerceRecommendationInterface.load({
          story: 'with-product-list',
          args: {language: 'fr'},
        });
        await expect(
          commerceRecommendationInterface
            .searchBox()
            .getByPlaceholder('Recherche')
        ).toBeVisible();
      });

      test('should default to english when an invalid language is selected', async ({
        commerceRecommendationInterface,
      }) => {
        await commerceRecommendationInterface.load({
          story: 'with-product-list',
          args: {language: 'foo'},
        });
        await expect(
          commerceRecommendationInterface.searchBox().getByPlaceholder('search')
        ).toBeVisible();
      });

      test('should default back to the non region locale (e.g., "es-ES" to "es")', async ({
        commerceRecommendationInterface,
      }) => {
        await commerceRecommendationInterface.load({
          story: 'with-product-list',
          args: {language: 'es-ES'},
        });

        await expect(
          commerceRecommendationInterface.searchBox().getByPlaceholder('buscar')
        ).toBeVisible();
      });

      test('should support changing the language of the interface after initialization', async ({
        page,
        commerceRecommendationInterface,
      }) => {
        await commerceRecommendationInterface.hydrated.waitFor();

        await page.evaluate(() => {
          const commerceRecommendationInterfaceComponent =
            document.querySelector(
              'atomic-commerce-recommendation-interface'
            ) as AtomicCommerceRecommendationInterface;

          commerceRecommendationInterfaceComponent.language = 'fr';
        });

        await expect(
          commerceRecommendationInterface
            .searchBox()
            .getByPlaceholder('Recherche')
        ).toBeVisible();
      });
      test('should revert to english after changing the language to an invalid value', async ({
        page,
        commerceRecommendationInterface,
      }) => {
        await commerceRecommendationInterface.load({
          story: 'with-product-list',
          args: {language: 'fr'},
        });

        await commerceRecommendationInterface.hydrated.waitFor();

        await page.evaluate(() => {
          const commerceRecommendationInterfaceComponent =
            document.querySelector(
              'atomic-commerce-recommendation-interface'
            ) as AtomicCommerceRecommendationInterface;

          commerceRecommendationInterfaceComponent.language = 'foo';
        });

        await expect(
          commerceRecommendationInterface.searchBox().getByPlaceholder('search')
        ).toBeVisible();
      });
    });

    test.describe('when selecting a facet value', () => {
      test.describe('when reflectStateInUrl is true', () => {
        test('should update the url', async ({
          page,
          commerceRecommendationInterface,
        }) => {
          const facetValueLabel =
            commerceRecommendationInterface.getFacetValue('Nike');

          await facetValueLabel.click();

          await page.waitForURL(
            '**/iframe.html?id=atomic-commerce-interface--with-product-list*'
          );

          const currentUrl = page.url();

          expect(currentUrl).toContain('Nike');
        });
      });
      test.describe('when reflectStateInUrl is false', () => {
        test('should not update the url', async ({
          page,
          commerceRecommendationInterface,
        }) => {
          await commerceRecommendationInterface.load({
            story: 'with-product-list',
            args: {reflectStateInUrl: false},
          });

          const facetValueLabel =
            commerceRecommendationInterface.getFacetValue('Nike');

          await facetValueLabel.click();

          await commerceRecommendationInterface
            .getBreadcrumbButtons('Nike')
            .waitFor({state: 'visible'});

          const currentUrl = page.url();

          expect(currentUrl).not.toContain('Nike');
        });
      });
    });
  });
});
