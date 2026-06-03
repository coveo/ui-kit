import {expect, test} from './fixture';

test.describe('AtomicSearchInterface', () => {
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
