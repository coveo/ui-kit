import {testSearch, testInsight, expect} from './fixture';
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';
import facetData from './data';

const fixtures = {
  search: testSearch as typeof testSearch,
  insight: testInsight as typeof testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test;
  if (useCase.value === useCaseEnum.search) {
    test = fixtures[useCase.value] as typeof testSearch;
  } else {
    test = fixtures[useCase.value] as typeof testInsight;
  }

  test.describe(`quantic facet ${useCase.label}`, () => {
    test.describe('when selecting and deselecting a facet value', () => {
      test('should trigger a new search and log the corresponding UA analytics events', async ({
        search,
        facet,
      }) => {
        const selectedIndex = 0;
        const {facetId, field, values} = facetData;
        const selectUaRequest = facet.waitForFacetSelectUaAnalytics({
          facetId,
          facetField: field,
          facetValue: values[selectedIndex].value,
        });
        let searchResponsePromise = search.waitForSearchResponse();

        await facet.clickOnFacetValue(selectedIndex);
        await selectUaRequest;
        let searchResponse = await searchResponsePromise;

        const {analytics: analyticsForFacetSelect} =
          facet.extractDataFromSearchResponse(searchResponse);
        expect(analyticsForFacetSelect.actionCause).toEqual('facetSelect');

        const deselectUaRequest = facet.waitForFacetDeselectUaAnalytics({
          facetId,
          facetField: field,
          facetValue: values[selectedIndex].value,
        });
        searchResponsePromise = search.waitForSearchResponse();
        await facet.clickOnFacetValue(selectedIndex);
        await deselectUaRequest;
        searchResponse = await searchResponsePromise;

        const {analytics: analyticsForFacetDeselect} =
          facet.extractDataFromSearchResponse(searchResponse);
        expect(analyticsForFacetDeselect.actionCause).toEqual('facetDeselect');
      });
    });

    test.describe('when selecting a facet value and clicking the clear filter button', () => {
      test('should trigger a new search and log the corresponding UA analytics events', async ({
        search,
        facet,
      }) => {
        const selectedIndex = 0;
        const {facetId, field, values} = facetData;
        const selectUaRequest = facet.waitForFacetSelectUaAnalytics({
          facetId,
          facetField: field,
          facetValue: values[selectedIndex].value,
        });
        let searchResponsePromise = search.waitForSearchResponse();

        await facet.clickOnFacetValue(selectedIndex);
        await selectUaRequest;
        let searchResponse = await searchResponsePromise;

        const {analytics: analyticsForFacetSelect} =
          facet.extractDataFromSearchResponse(searchResponse);
        expect(analyticsForFacetSelect.actionCause).toEqual('facetSelect');

        const clearAllUaRequest = facet.waitForFacetClearAllUaAnalytics({
          facetId,
          facetField: field,
        });
        searchResponsePromise = search.waitForSearchResponse();
        await facet.clickOnClearSelectionButton();
        await clearAllUaRequest;
        searchResponse = await searchResponsePromise;

        const {analytics: analyticsForFacetDeselect} =
          facet.extractDataFromSearchResponse(searchResponse);
        expect(analyticsForFacetDeselect.actionCause).toEqual('facetClearAll');
      });
    });

    test.describe('when expanding and collapsing facet values using Show More/Less buttons', () => {
      test('should fetch additional facet values and send correct UA analytics', async ({
        search,
        facet,
      }) => {
        const {facetId, field} = facetData;
        const uaRequest = facet.waitForShowMoreFacetResultsUaAnalytics({
          facetId,
          facetField: field,
        });
        let searchResponsePromise = search.waitForSearchResponse();

        await facet.clickOnshowMoreFacetValuesButton();

        await uaRequest;
        let searchResponse = await searchResponsePromise;
        const {analytics: analyticsForShowMore} =
          facet.extractDataFromSearchResponse(searchResponse);
        expect(analyticsForShowMore.actionCause).toEqual(
          'showMoreFacetResults'
        );

        const showLessUaRequest = facet.waitForShowLessFacetResultsUaAnalytics({
          facetId,
          facetField: field,
        });
        searchResponsePromise = search.waitForSearchResponse();

        await facet.clickOnshowLessFacetValuesButton();

        await showLessUaRequest;
        searchResponse = await searchResponsePromise;
        const {analytics: analyticsForShowLess} =
          facet.extractDataFromSearchResponse(searchResponse);
        expect(analyticsForShowLess.actionCause).toEqual(
          'showLessFacetResults'
        );
      });
    });

    test.describe('when a custom caption is provided', () => {
      const exampleCaption = 'example caption';
      const facetValueIndex = 0;

      test.use({
        options: {
          caption: exampleCaption,
          value: facetData.values[facetValueIndex].value,
        },
      });
      test('should display the custom caption instead of the raw facet value', async ({
        search,
        facet,
      }) => {
        expect(facet.facetValue.nth(facetValueIndex)).toHaveText(
          exampleCaption
        );
        const {facetId, field, values} = facetData;
        const uaRequest = facet.waitForFacetSelectUaAnalytics({
          facetId,
          facetField: field,
          facetValue: values[facetValueIndex].value,
        });
        const searchResponsePromise = search.waitForSearchResponse();

        await facet.clickOnFacetValue(facetValueIndex);
        await uaRequest;
        await searchResponsePromise;

        expect(facet.facetBreadcrumbValue(facetValueIndex)).toHaveText(
          exampleCaption
        );
      });
    });

    if (useCase.value === 'search') {
      test.describe('when typing in the facet search box input', () => {
        test('should fetch facet values according to the query', async ({
          search,
          facet,
        }) => {
          const {field: expectedField} = facetData;
          const exampleQuery = 'test';
          const facetSearchResponsePromise =
            search.waitForFacetSearchResponse();
          await facet.fillFacetSearchBoxInput(exampleQuery);
          const facetSearchResponse = await facetSearchResponsePromise;
          const {field, query} =
            facet.extractDataFromSearchResponse(facetSearchResponse);

          expect(field).toEqual(expectedField);
          expect(query).toContain(exampleQuery);
        });
      });

      test.describe('with a selected value in the URL', () => {
        const selectedIndex = 0;
        const {field, values} = facetData;
        test.use({
          urlHash: `f-${field}=${values[selectedIndex].value}`,
          preventMockFacetResponse: true,
        });

        test('should select the correct facet value', async ({facet}) => {
          await expect(facet.facetValueInput.nth(selectedIndex)).toBeChecked();
          expect(facet.facetValue.nth(selectedIndex)).toHaveText(
            values[selectedIndex].value
          );
        });
      });
    }
  });
});
