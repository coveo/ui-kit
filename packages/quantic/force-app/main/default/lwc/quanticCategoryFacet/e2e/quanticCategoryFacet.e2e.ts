import {testSearch, testInsight, expect} from './fixture';
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';
import {expandedFacetData, initialFacetData, selectedFacetData} from './data';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic category facet ${useCase.label}`, () => {
    test.describe('when selecting a facet value and clicking the all categories button', () => {
      const selectedIndex = 0;
      const {facetId, field, values} = initialFacetData;
      const selectedValue = values[selectedIndex].value;

      test.use({
        facetResponses: {
          responses: [
            [initialFacetData],
            [selectedFacetData],
            [initialFacetData],
          ],
        },
      });

      test('should trigger a new search and log the corresponding UA analytics events', async ({
        baseFacet,
        facet,
        page,
      }) => {
        const expectedFacetData = {
          facetId,
          facetField: field,
          facetValue: selectedValue,
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
          const url = page.url();
          expect(decodeURIComponent(url)).toContain(
            `cf-${field}=${selectedValue}`
          );
        }

        const facetClearAllUaRequest =
          baseFacet.waitForFacetClearAllUaAnalytics({
            facetId,
            facetField: field,
          });
        const secondSearchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.allCategoriesButton.click();

        await facetClearAllUaRequest;
        const secondSearchResponse = await secondSearchResponsePromise;
        const {analytics: analyticsForFacetDeselect} =
          baseFacet.extractDataFromResponse(secondSearchResponse);
        expect(analyticsForFacetDeselect.actionCause).toEqual('facetClearAll');
      });
    });

    test.describe('when expanding and collapsing facet values using Show More/Less buttons', () => {
      test.use({
        facetResponses: {
          responses: [[initialFacetData], [expandedFacetData]],
        },
        options: {
          numberOfValues: 2,
        },
      });

      test('should fetch additional facet values and send correct UA analytics', async ({
        baseFacet,
        facet,
      }) => {
        const {facetId, field} = initialFacetData;
        const uaRequest = baseFacet.waitForShowMoreFacetResultsUaAnalytics({
          facetId,
          facetField: field,
        });
        const firstSearchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.showMoreFacetValuesButton.click();

        await uaRequest;
        const firstSearchResponse = await firstSearchResponsePromise;
        const {analytics: analyticsForShowMore} =
          baseFacet.extractDataFromResponse(firstSearchResponse);
        expect(analyticsForShowMore.actionCause).toEqual(
          'showMoreFacetResults'
        );

        const showLessUaRequest =
          baseFacet.waitForShowLessFacetResultsUaAnalytics({
            facetId,
            facetField: field,
          });
        const secondSearchResponsePromise = baseFacet.waitForSearchResponse();

        await facet.showLessFacetValuesButton.click();

        await showLessUaRequest;
        const secondSearchResponse = await secondSearchResponsePromise;
        const {analytics: analyticsForShowLess} =
          baseFacet.extractDataFromResponse(secondSearchResponse);
        expect(analyticsForShowLess.actionCause).toEqual(
          'showLessFacetResults'
        );
      });
    });

    test.describe('when a custom caption is provided', () => {
      const exampleCaption = 'example caption';
      const facetValueIndex = 0;

      test.use({
        facetResponses: {
          responses: [[initialFacetData], [selectedFacetData]],
        },
        options: {
          caption: exampleCaption,
          value: initialFacetData.values[facetValueIndex].value,
        },
      });
      test('should display the custom caption instead of the raw facet value', async ({
        baseFacet,
        facet,
      }) => {
        expect(facet.facetValue.nth(facetValueIndex)).toHaveText(
          new RegExp(exampleCaption)
        );
        const {facetId, field, values} = initialFacetData;
        const expectedFacetData = {
          facetId,
          facetField: field,
          facetValue: values[facetValueIndex].value,
        };
        const uaRequest =
          baseFacet.waitForFacetSelectUaAnalytics(expectedFacetData);
        const searchResponsePromise = baseFacet.waitForSearchResponse();
        await facet.clickOnFacetValue(facetValueIndex);
        await uaRequest;
        const searchResponse = await searchResponsePromise;
        const {analytics} = baseFacet.extractDataFromResponse(searchResponse);

        if (useCase.value === useCaseEnum.search) {
          expect(analytics.customData).toEqual(
            expect.objectContaining(expectedFacetData)
          );
        }
        expect(facet.facetBreadcrumbValueByIndex(facetValueIndex)).toHaveText(
          exampleCaption
        );
      });
    });

    if (useCase.value === useCaseEnum.search) {
      test.describe('when typing in the facet search box input', () => {
        test.use({
          options: {
            withSearch: true,
          },
        });

        test('should fetch facet values according to the query typed', async ({
          baseFacet,
          facet,
        }) => {
          const {field: expectedField} = initialFacetData;
          const exampleQuery = 'test';
          const facetSearchResponsePromise =
            baseFacet.waitForFacetSearchResponse();

          await facet.fillFacetSearchBoxInput(exampleQuery);

          const facetSearchResponse = await facetSearchResponsePromise;
          const {field, query} =
            baseFacet.extractDataFromResponse(facetSearchResponse);
          expect(field).toEqual(expectedField);
          expect(query).toContain(exampleQuery);
        });
      });

      test.describe('with a selected value in the URL', () => {
        const selectedIndex = 0;
        const {field, values} = initialFacetData;
        test.use({
          urlHash: `cf-${field}=${values[selectedIndex].value}`,
          facetResponses: {
            responses: [],
          },
        });

        test('should select the correct facet value', async ({facet}) => {
          expect(facet.activeParent).toHaveText(
            new RegExp(values[selectedIndex].value)
          );
        });
      });
    }
  });
});
