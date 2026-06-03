import {testSearch, testInsight, expect} from './fixture';
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

const exampleField = 'Date';

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic timeframe facet ${useCase.label}`, () => {
    test.describe('when selecting and deselecting a facet value', () => {
      test('should trigger a new search and log the corresponding UA analytics events', async ({
        baseFacet,
        facet,
      }) => {
        const selectedIndex = 0;
        const expectedStartDate = 'now';
        const expectedEndDate = 'next-1-year';
        const expectedFacetData = {
          facetId: exampleField,
          facetField: exampleField,
          facetValue: `${expectedStartDate}..${expectedEndDate}`,
        };
        const facetSelectUaRequest =
          baseFacet.waitForFacetSelectUaAnalytics(expectedFacetData);
        const firstSearchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.clickOnFacetValue(selectedIndex);

        await facetSelectUaRequest;
        const firstSearchResponse = await firstSearchResponsePromise;
        const {analytics: analyticsForFacetSelect} =
          baseFacet.extractDataFromResponse(firstSearchResponse);
        expect(analyticsForFacetSelect.actionCause).toEqual('facetSelect');
        if (useCase.value === useCaseEnum.search) {
          expect(analyticsForFacetSelect.customData).toEqual(
            expect.objectContaining(expectedFacetData)
          );
        }

        const facetDeselectUaRequest =
          baseFacet.waitForFacetDeselectUaAnalytics(expectedFacetData);
        const secondSearchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.clickOnFacetValue(selectedIndex);

        await facetDeselectUaRequest;
        const secondSearchResponse = await secondSearchResponsePromise;
        const {analytics: analyticsForFacetDeselect} =
          baseFacet.extractDataFromResponse(secondSearchResponse);
        expect(analyticsForFacetDeselect.actionCause).toEqual('facetDeselect');
      });
    });

    test.describe('when selecting a facet value and clicking the clear filter button', () => {
      test('should trigger a new search and log the corresponding UA analytics events', async ({
        baseFacet,
        facet,
      }) => {
        const selectedIndex = 0;
        const expectedStartDate = 'now';
        const expectedEndDate = 'next-1-year';
        const expectedFacetData = {
          facetId: exampleField,
          facetField: exampleField,
          facetValue: `${expectedStartDate}..${expectedEndDate}`,
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

        const clearAllUaRequest = baseFacet.waitForFacetClearAllUaAnalytics({
          facetId: exampleField,
          facetField: exampleField,
        });
        searchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.clearSelectionButton.click();

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
        const exampleStart = '2025-01-01';
        const exampleEnd = '2025-01-02';
        const expectedFacetData = {
          facetId: `${exampleField}_input`,
          facetField: exampleField,
          facetValue: `${exampleStart.replaceAll('-', '/')}@00:00:00..${exampleEnd.replaceAll('-', '/')}@23:59:59`,
        };

        const facetSelectUaRequest =
          baseFacet.waitForFacetSelectUaAnalytics(expectedFacetData);
        const searchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.fillFilterStartInput(exampleStart);
        await facet.fillFilterEndInput(exampleEnd);
        await facet.filterApplyButton.click();

        await facetSelectUaRequest;
        const searchResponse = await searchResponsePromise;
        const {analytics: analyticsForFacetSelect} =
          baseFacet.extractDataFromResponse(searchResponse);
        expect(analyticsForFacetSelect.actionCause).toEqual('facetSelect');
        if (useCase.value === useCaseEnum.search) {
          expect(analyticsForFacetSelect.customData).toEqual(
            expect.objectContaining(expectedFacetData)
          );
        }
      });
    });

    if (useCase.value === useCaseEnum.search) {
      test.describe('with a selected value in the URL', () => {
        const selectedIndex = 0;
        const date = new Date();
        date.setFullYear(date.getFullYear() + 20);
        const todayDate = date.toISOString().slice(0, 10);
        date.setDate(date.getDate() - 1);
        const yesterdayDate = date.toISOString().slice(0, 10);
        test.use({
          urlHash: `df-${exampleField}=${yesterdayDate.replaceAll('-', '/')}@00:00:00..${todayDate.replaceAll('-', '/')}@23:59:59`,
        });

        test('should select the correct facet value', async ({facet}) => {
          await expect(facet.facetValue.nth(selectedIndex)).toHaveAttribute(
            'aria-pressed',
            'true'
          );
          expect(facet.facetValue.nth(selectedIndex)).toHaveText(
            new RegExp(`${yesterdayDate} - ${todayDate}`)
          );
        });
      });
    }
  });
});
