import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';
import {testSearch, testInsight, expect} from './fixture';

const fixtures = {
  search: testSearch as typeof testSearch,
  insight: testInsight as typeof testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic-summary ${useCase.label}`, () => {
    test.describe('when selecting result per page', () => {
      test('should display the correct per-page number and log analytics', async ({
        search,
        summary,
      }) => {
        const customResultsPerPage = 45;
        const searchResponsePromise = search.waitForSearchResponse();
        const analyticsRequestPromise = summary.waitForCustomEvent();
        await summary.setResultsPerPage(customResultsPerPage);
        const searchResponse = await searchResponsePromise;
        const analyticsRequest = await analyticsRequestPromise;

        const totalCount = (await searchResponse.json()).totalCount;

        await expect(summary.summaryQuery).not.toBeVisible();
        await expect(summary.summaryRange).toBeVisible();
        await expect(await summary.getRange()).toBe(
          `1-${customResultsPerPage}`
        );
        await expect(summary.summaryTotal).toBeVisible();
        await expect(await summary.getTotal()).toBe(
          Intl.NumberFormat().format(totalCount)
        );

        const analyticsBody = analyticsRequest.postDataJSON();
        expect(analyticsBody.eventType).toBe('getMoreResults');
        expect(analyticsBody.eventValue).toBe('pagerResize');
        expect(analyticsBody.customData.currentResultsPerPage).toBe(
          customResultsPerPage
        );
      });
    });

    test.describe('when selecting next page', () => {
      test('should update the summary and log analytics', async ({
        search,
        summary,
      }) => {
        const defaultNumberOfResults = 10;
        const analyticsRequestPromise = summary.waitForCustomEvent();
        await summary.goToNextPage();

        const searchResponse = await search.waitForSearchResponse();
        const analyticsRequest = await analyticsRequestPromise;
        const totalCount = (await searchResponse.json()).totalCount;

        await expect(summary.summaryQuery).not.toBeVisible();
        await expect(summary.summaryRange).toBeVisible();
        await expect(await summary.getRange()).toBe(
          `${defaultNumberOfResults + 1}-${defaultNumberOfResults * 2}`
        );
        await expect(summary.summaryTotal).toBeVisible();
        await expect(await summary.getTotal()).toBe(
          Intl.NumberFormat().format(totalCount)
        );

        const analyticsBody = analyticsRequest.postDataJSON();
        expect(analyticsBody.eventType).toBe('getMoreResults');
        expect(analyticsBody.eventValue).toBe('pagerNext');
        expect(analyticsBody.customData.pagerNumber).toBe(2);
      });
    });
  });
});
