import {test, expect} from './fixture';

const testFieldsToInclude = 'foo,bar,baz';

test.describe('quantic recommendation list', () => {
  test.describe('when clicking a recommendation', () => {
    test('should log recommendation open analytics', async ({
      recommendationList,
    }) => {
      await recommendationList.captureRecommendationListClickEventWorkaround();

      const recommendationClickAnalyticsPromise =
        recommendationList.waitForRecommendationListClickEvent();

      const firstRecommendationLink =
        recommendationList.getRecommendationLinkByIndex(0);
      firstRecommendationLink.scrollIntoViewIfNeeded();
      await firstRecommendationLink.evaluate((el) =>
        el.setAttribute('href', '#')
      );
      await firstRecommendationLink.click();

      await recommendationClickAnalyticsPromise;
    });
  });

  test.describe('when getting new recommendations', () => {
    test.use({
      options: {
        fieldsToInclude: testFieldsToInclude,
      },
    });

    test('should perform a search request with the correct fieldsToInclude', async ({
      recommendationList,
      search,
    }) => {
      const expectedFieldsToInclude = testFieldsToInclude.split(',');
      const expectedRecommendationValue = 'Recommendation';
      const searchRequestPromise = search.waitForSearchRequest();
      await search.performRecommendationSearch();
      const requestBody = (await searchRequestPromise).postDataJSON();
      expect(requestBody?.fieldsToInclude).toBeDefined();
      expect(requestBody).toEqual(
        expect.objectContaining({
          fieldsToInclude: expect.arrayContaining(expectedFieldsToInclude),
          recommendation: expectedRecommendationValue,
        })
      );
      await expect(recommendationList.recommendationList).toBeVisible();
    });
  });
});
