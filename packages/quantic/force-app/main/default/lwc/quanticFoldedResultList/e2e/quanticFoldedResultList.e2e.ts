/* eslint-disable @lwc/lwc/no-document-query */
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';
import {testInsight, testSearch, expect} from './fixture';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

const testFieldsToInclude = 'foo,bar,baz';
const SEARCH_ORIGINCONTEXT = 'Search';
const INSIGHT_ORIGINCONTEXT = 'InsightPanel';

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic folded result list ${useCase.label}`, () => {
    test.describe('when performing a search', () => {
      test.use({
        options: {
          fieldsToInclude: testFieldsToInclude,
        },
      });
      test('should send the added fieldsToInclude in the Search API request', async ({
        resultList,
        search,
      }) => {
        const expectedFieldsToInclude = testFieldsToInclude.split(',');
        const searchRequestPromise = search.waitForSearchRequest();
        await search.performSearch();
        const requestBody = (await searchRequestPromise).postDataJSON();
        expect(requestBody?.fieldsToInclude).toBeDefined();
        expect(requestBody).toEqual(
          expect.objectContaining({
            fieldsToInclude: expect.arrayContaining(expectedFieldsToInclude),
          })
        );
        await expect(resultList.resultList).toBeVisible();
      });
    });

    test.describe('analytics request', () => {
      test('when clicking a result link should send the expected click event with the correct data', async ({
        resultList,
      }) => {
        await resultList.captureClickEventWorkaround();

        const expectedOriginContext =
          useCase.value === useCaseEnum.insight
            ? INSIGHT_ORIGINCONTEXT
            : SEARCH_ORIGINCONTEXT;
        const firstResultLink = resultList.getResultLink(0);
        const firstResultLinkHref = await firstResultLink.getAttribute('href');
        await resultList.preventNavigationFromResultLink(0);

        const expectedUaRequestPromise =
          resultList.waitForResultLinkClickUaAnalytics({
            documentUrl: firstResultLinkHref,
            originContext: expectedOriginContext,
          });
        await resultList.clickResultLink(0);
        await expectedUaRequestPromise;
      });
    });
  });
});
