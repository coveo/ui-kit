/* eslint-disable @cspell/spellchecker */
import type {AtomicSearchInterface} from '../atomic-search-interface';
import {expect, test} from './fixture';

test.describe('AtomicSearchInterface', () => {
  test.describe('when search has not been initialized', () => {
    test.beforeEach(async ({searchInterface}) => {
      await searchInterface.load({
        story: 'search-before-init',
      });
    });

    test('should return error if request is executed', async ({page}) => {
      const beforeInitError =
        'You have to call "initialize" on the atomic-search-interface component before modifying the props or calling other public methods.';

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
    test.beforeEach(async ({searchInterface}) => {
      await searchInterface.load({
        story: 'with-a-result-list',
      });
    });

    test.describe('when a language is provided', () => {
      test('should set the language of the interface', async ({
        searchInterface,
      }) => {
        await searchInterface.load({
          story: 'with-a-result-list',
          args: {language: 'fr'},
        });
        await expect(
          searchInterface.searchBox().getByPlaceholder('Recherche')
        ).toBeVisible();
      });

      test('should default to english when an invalid language is selected', async ({
        searchInterface,
      }) => {
        await searchInterface.load({
          story: 'with-a-result-list',
          args: {language: 'foo'},
        });
        await expect(
          searchInterface.searchBox().getByPlaceholder('search')
        ).toBeVisible();
      });

      test('should default back to the non region locale (e.g., "es-ES" to "es")', async ({
        searchInterface,
      }) => {
        await searchInterface.load({
          story: 'with-a-result-list',
          args: {language: 'es-ES'},
        });

        await expect(
          searchInterface.searchBox().getByPlaceholder('buscar')
        ).toBeVisible();
      });

      test('should support changing the language of the interface after initialization', async ({
        page,
        searchInterface,
      }) => {
        await searchInterface.hydrated.waitFor();

        await page.evaluate(() => {
          const searchInterfaceComponent = document.querySelector(
            'atomic-search-interface'
          ) as AtomicSearchInterface;

          searchInterfaceComponent.language = 'fr';
        });

        await expect(
          searchInterface.searchBox().getByPlaceholder('Recherche')
        ).toBeVisible();
      });
      test('should revert to english after changing the language to an invalid value', async ({
        page,
        searchInterface,
      }) => {
        await searchInterface.load({
          story: 'with-a-result-list',
          args: {language: 'fr'},
        });

        await searchInterface.hydrated.waitFor();

        await page.evaluate(() => {
          const searchInterfaceComponent = document.querySelector(
            'atomic-search-interface'
          ) as AtomicSearchInterface;

          searchInterfaceComponent.language = 'foo';
        });

        await expect(
          searchInterface.searchBox().getByPlaceholder('search')
        ).toBeVisible();
      });
    });

    test.describe('when selecting a facet value', () => {
      test.describe('when reflectStateInUrl is true', () => {
        test('should update the url', async ({page, searchInterface}) => {
          const facetValueLabel = searchInterface.getFacetValue('Susan Cook');

          await facetValueLabel.click();

          await page.waitForURL(
            '**/iframe.html?id=atomic-search-interface--with-a-result-list*'
          );

          const currentUrl = page.url();

          expect(currentUrl).toContain('Susan%20Cook');
        });
      });
    });
  });
});
