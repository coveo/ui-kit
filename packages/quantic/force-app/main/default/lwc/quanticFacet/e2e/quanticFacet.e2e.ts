import {testSearch, testInsight, expect} from './fixture';
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';
import facetData from './data';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic facet ${useCase.label}`, () => {
    test.describe('when selecting and deselecting a facet value', () => {
      test('should trigger a new search and log the corresponding UA analytics events', async ({
        baseFacet,
        facet,
      }) => {
        const selectedIndex = 0;
        const {facetId, field, values} = facetData;
        const selectUaRequest = baseFacet.waitForFacetSelectUaAnalytics({
          facetId,
          facetField: field,
          facetValue: values[selectedIndex].value,
        });
        let searchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.clickOnFacetValue(selectedIndex);

        await selectUaRequest;
        let searchResponse = await searchResponsePromise;
        const {analytics: analyticsForFacetSelect} =
          facet.extractDataFromSearchResponse(searchResponse);
        expect(analyticsForFacetSelect.actionCause).toEqual('facetSelect');

        const deselectUaRequest = baseFacet.waitForFacetDeselectUaAnalytics({
          facetId,
          facetField: field,
          facetValue: values[selectedIndex].value,
        });
        searchResponsePromise = baseFacet.waitForSearchResponse();

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
        baseFacet,
        facet,
      }) => {
        const selectedIndex = 0;
        const {facetId, field, values} = facetData;
        const selectUaRequest = baseFacet.waitForFacetSelectUaAnalytics({
          facetId,
          facetField: field,
          facetValue: values[selectedIndex].value,
        });
        let searchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.clickOnFacetValue(selectedIndex);

        await selectUaRequest;
        let searchResponse = await searchResponsePromise;
        const {analytics: analyticsForFacetSelect} =
          facet.extractDataFromSearchResponse(searchResponse);
        expect(analyticsForFacetSelect.actionCause).toEqual('facetSelect');

        const clearAllUaRequest = baseFacet.waitForFacetClearAllUaAnalytics({
          facetId,
          facetField: field,
        });
        searchResponsePromise = baseFacet.waitForSearchResponse();

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
        baseFacet,
        facet,
      }) => {
        const {facetId, field} = facetData;
        const uaRequest = baseFacet.waitForShowMoreFacetResultsUaAnalytics({
          facetId,
          facetField: field,
        });
        let searchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.clickOnshowMoreFacetValuesButton();

        await uaRequest;
        let searchResponse = await searchResponsePromise;
        const {analytics: analyticsForShowMore} =
          facet.extractDataFromSearchResponse(searchResponse);
        expect(analyticsForShowMore.actionCause).toEqual(
          'showMoreFacetResults'
        );

        const showLessUaRequest =
          baseFacet.waitForShowLessFacetResultsUaAnalytics({
            facetId,
            facetField: field,
          });
        searchResponsePromise = baseFacet.waitForSearchResponse();

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
        baseFacet,
        facet,
      }) => {
        expect(facet.facetValue.nth(facetValueIndex)).toHaveText(
          exampleCaption
        );
        const {facetId, field, values} = facetData;
        const uaRequest = baseFacet.waitForFacetSelectUaAnalytics({
          facetId,
          facetField: field,
          facetValue: values[facetValueIndex].value,
        });
        const searchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.clickOnFacetValue(facetValueIndex);

        await uaRequest;
        await searchResponsePromise;
        expect(facet.facetBreadcrumbValue(facetValueIndex)).toHaveText(
          exampleCaption
        );
      });
    });

    if (useCase.value === useCaseEnum.search) {
      test.describe('when typing in the facet search box input', () => {
        test('should fetch facet values according to the query', async ({
          baseFacet,
          facet,
        }) => {
          const {field: expectedField} = facetData;
          const exampleQuery = 'test';
          const facetSearchResponsePromise =
            baseFacet.waitForFacetSearchResponse();

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
