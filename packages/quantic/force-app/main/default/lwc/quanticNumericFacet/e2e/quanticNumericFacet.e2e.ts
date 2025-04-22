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
  test.describe(`quantic numeric facet ${useCase.label}`, () => {
    test.describe('when selecting and deselecting a facet value', () => {
      test('should trigger a new search and log the corresponding UA analytics events', async ({
        baseFacet,
        facet,
      }) => {
        const selectedIndex = 0;
        const {facetId, field, values} = facetData;
        const facetSelectUaRequest = baseFacet.waitForFacetSelectUaAnalytics({
          facetId,
          facetField: field,
          facetValue: `${values[selectedIndex].start}..${values[selectedIndex].end}`,
        });
        let searchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.clickOnFacetValue(selectedIndex);

        await facetSelectUaRequest;
        let searchResponse = await searchResponsePromise;
        const {analytics: analyticsForFacetSelect} =
          baseFacet.extractDataFromResponse(searchResponse);
        expect(analyticsForFacetSelect.actionCause).toEqual('facetSelect');

        const facetDeselectUaRequest =
          baseFacet.waitForFacetDeselectUaAnalytics({
            facetId,
            facetField: field,
            facetValue: `${values[selectedIndex].start}..${values[selectedIndex].end}`,
          });
        searchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.clickOnFacetValue(selectedIndex);

        await facetDeselectUaRequest;
        searchResponse = await searchResponsePromise;
        const {analytics: analyticsForFacetDeselect} =
          baseFacet.extractDataFromResponse(searchResponse);
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
        const expectedFacetData = {
          facetId,
          facetField: field,
          facetValue: `${values[selectedIndex].start}..${values[selectedIndex].end}`,
        };

        const facetSelectUaRequest =
          baseFacet.waitForFacetSelectUaAnalytics(expectedFacetData);
        let searchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.clickOnFacetValue(selectedIndex);

        await facetSelectUaRequest;
        let searchResponse = await searchResponsePromise;
        const {analytics: analyticsForFacetSelect} =
          baseFacet.extractDataFromResponse(searchResponse);
        expect(analyticsForFacetSelect.actionCause).toEqual('facetSelect');
        expect(analyticsForFacetSelect.customData).toEqual(
          expect.objectContaining(expectedFacetData)
        );

        const clearAllUaRequest = baseFacet.waitForFacetClearAllUaAnalytics({
          facetId,
          facetField: field,
        });
        searchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.clickOnClearSelectionButton();

        await clearAllUaRequest;
        searchResponse = await searchResponsePromise;
        const {analytics: analyticsForFacetDeselect} =
          baseFacet.extractDataFromResponse(searchResponse);
        expect(analyticsForFacetDeselect.actionCause).toEqual('facetClearAll');
      });
    });

    test.describe('when typing in the facet search box input', () => {
      test('should fetch facet values according to the query typed', async ({
        baseFacet,
        facet,
      }) => {
        const exampleMin = '1';
        const exampleMax = '2';
        const {facetId, field} = facetData;
        const expectedFacetData = {
          facetId: `${facetId}_input`,
          facetField: field,
          facetValue: `${exampleMin}..${exampleMax}`,
        };

        const facetSelectUaRequest =
          baseFacet.waitForFacetSelectUaAnalytics(expectedFacetData);
        let searchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.fillFilterMinInput(exampleMin);
        await facet.fillFilterMaxInput(exampleMax);
        await facet.clickOnFilterApplyButton();

        await facetSelectUaRequest;
        let searchResponse = await searchResponsePromise;
        const {analytics: analyticsForFacetSelect} =
          baseFacet.extractDataFromResponse(searchResponse);
        expect(analyticsForFacetSelect.actionCause).toEqual('facetSelect');
        expect(analyticsForFacetSelect.customData).toEqual(
          expect.objectContaining(expectedFacetData)
        );
      });
    });

    if (useCase.value === useCaseEnum.search) {
      test.describe('with a selected value in the URL', () => {
        const selectedIndex = 0;
        const {field, values} = facetData;
        test.use({
          urlHash: `nf-${field}=${values[selectedIndex].start}..${values[selectedIndex].end}`,
          facetResponseMock: undefined,
        });

        test('should select the correct facet value', async ({facet}) => {
          await expect(facet.facetValueInput.nth(selectedIndex)).toBeChecked();
          expect(facet.facetValue.nth(selectedIndex)).toHaveText(
            `${values[selectedIndex].start} - ${values[selectedIndex].end}`
          );
        });
      });
    }
  });
});
