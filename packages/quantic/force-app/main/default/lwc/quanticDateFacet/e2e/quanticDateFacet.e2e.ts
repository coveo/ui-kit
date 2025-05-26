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

const exampleField = 'Date';

function formatFacetRange(facetValue: {start: string; end: string}): string {
  const formatDate = (dateTime: string) => {
    const [date] = dateTime.split('@');
    return date.replaceAll('/', '-');
  };

  return `${formatDate(facetValue.start)} - ${formatDate(facetValue.end)}`;
}

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic date facet ${useCase.label}`, () => {
    test.describe('when selecting and deselecting a facet value', () => {
      test('should trigger a new search and log the corresponding UA analytics events', async ({
        baseFacet,
        facet,
        page,
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
        await facet.clickOnFacetValueWithText(
          formatFacetRange(values[selectedIndex])
        );

        await facetSelectUaRequest;
        let searchResponse = await searchResponsePromise;

        const {analytics: analyticsForFacetSelect} =
          baseFacet.extractDataFromResponse(searchResponse);
        expect(analyticsForFacetSelect.actionCause).toEqual('facetSelect');

        if (useCase.value === useCaseEnum.search) {
          expect(analyticsForFacetSelect.customData).toEqual(
            expect.objectContaining(expectedFacetData)
          );
          const url = page.url();
          expect(decodeURIComponent(url)).toContain(
            `df-${field}=${values[selectedIndex].start}..${values[selectedIndex].end}`
          );
        }

        const facetDeselectUaRequest =
          baseFacet.waitForFacetDeselectUaAnalytics({
            facetId,
            facetField: field,
            facetValue: `${values[selectedIndex].start}..${values[selectedIndex].end}`,
          });
        searchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.clickOnFacetValueWithText(
          formatFacetRange(values[selectedIndex])
        );

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
        await facet.clickOnFacetValueWithText(
          formatFacetRange(values[selectedIndex])
        );

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

    if (useCase.value === useCaseEnum.search) {
      test.describe('with a selected value in the URL', () => {
        const date = new Date();
        const todayDate = date.toISOString().slice(0, 10);
        date.setDate(date.getDate() - 1);
        const yesterdayDate = date.toISOString().slice(0, 10);

        test.use({
          urlHash: `df-${exampleField}=${yesterdayDate.replaceAll('-', '/')}@00:00:00..${todayDate.replaceAll('-', '/')}@23:59:59`,
          facetResponseMock: undefined,
        });

        test('should select the correct facet value', async ({facet}) => {
          await expect(
            await facet.getFacetValueWithText(`${yesterdayDate} - ${todayDate}`)
          ).toHaveAttribute('aria-pressed', 'true');
        });
      });
    }
  });
});
