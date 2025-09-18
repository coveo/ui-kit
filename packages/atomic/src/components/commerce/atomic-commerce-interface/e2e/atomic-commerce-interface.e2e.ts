/* eslint-disable @cspell/spellchecker */
import type {AtomicCommerceInterface} from '../atomic-commerce-interface';
import {expect, test} from './fixture';

test.describe('atomic-commerce-interface', () => {
  test.describe('when search has not been initialized', () => {
    test.beforeEach(async ({commerceInterface}) => {
      await commerceInterface.load({
        story: 'search-before-init',
      });
    });

    test('should return error if request is executed', async ({page}) => {
      const beforeInitError =
        'You have to call "initialize" on the atomic-commerce-interface component before modifying the props or calling other public methods.';

      let errorMessage = '';

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errorMessage = msg.text();
        }
      });

      await page.waitForEvent('console', {
        predicate: (msg) =>
          msg.type() === 'error' && msg.text().includes(beforeInitError),
        timeout: 5000,
      });

      expect(errorMessage).toContain(beforeInitError);
    });
  });

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

      test('should default to english when an invalid language is selected', async ({
        commerceInterface,
      }) => {
        await commerceInterface.load({
          story: 'with-product-list',
          args: {language: 'foo'},
        });
        await expect(
          commerceInterface.searchBox().getByPlaceholder('search')
        ).toBeVisible();
      });

      test('should default back to the non region locale (e.g., "es-ES" to "es")', async ({
        commerceInterface,
      }) => {
        await commerceInterface.load({
          story: 'with-product-list',
          args: {language: 'es-ES'},
        });

        await expect(
          commerceInterface.searchBox().getByPlaceholder('buscar')
        ).toBeVisible();
      });

      test('should support changing the language of the interface after initialization', async ({
        page,
        commerceInterface,
      }) => {
        await commerceInterface.hydrated.waitFor();

        await page.evaluate(() => {
          const commerceInterfaceComponent = document.querySelector(
            'atomic-commerce-interface'
          ) as AtomicCommerceInterface;

          commerceInterfaceComponent.language = 'fr';
        });

        await expect(
          commerceInterface.searchBox().getByPlaceholder('Recherche')
        ).toBeVisible();
      });
      test('should revert to english after changing the language to an invalid value', async ({
        page,
        commerceInterface,
      }) => {
        await commerceInterface.load({
          story: 'with-product-list',
          args: {language: 'fr'},
        });

        await commerceInterface.hydrated.waitFor();

        await page.evaluate(() => {
          const commerceInterfaceComponent = document.querySelector(
            'atomic-commerce-interface'
          ) as AtomicCommerceInterface;

          commerceInterfaceComponent.language = 'foo';
        });

        await expect(
          commerceInterface.searchBox().getByPlaceholder('search')
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
      test.describe('when disable-state-reflection-in-url is true', () => {
        test('should not update the url', async ({page, commerceInterface}) => {
          await commerceInterface.load({
            story: 'with-product-list',
            args: {'disable-state-reflection-in-url': true},
          });

          const facetValueLabel = commerceInterface.getFacetValue('Nike');

          await facetValueLabel.click();

          await commerceInterface
            .getBreadcrumbButtons('Nike')
            .waitFor({state: 'visible'});

          const currentUrl = page.url();

          expect(currentUrl).not.toContain('Nike');
        });
      });
    });
  });
});
