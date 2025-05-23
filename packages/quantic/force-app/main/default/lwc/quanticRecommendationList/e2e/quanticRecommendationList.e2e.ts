import {test, expect} from './fixture';

const testFieldsToInclude = 'foo,bar,baz';

test.describe('quantic recommendation list', () => {
  test.describe('when clicking a recommendation', () => {
    test('should log recommendation open analytics', async ({
      recommendationList,
    }) => {
      await recommendationList.captureRecommendationListClickEventWorkaround();

      const recommendationClickAnalyticsPromise =
        recommendationList.waitForRecommendationListClickEvent(
          'recommendationOpen'
        );

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

  test.describe('fieldsToInclude in the Search API request', () => {
    test.use({
      options: {
        fieldsToInclude: testFieldsToInclude,
      },
    });

    test('when performing a search should send the added fieldsToInclude', async ({
      recommendationList,
      search,
    }) => {
      const expectedFieldsToInclude = testFieldsToInclude.split(',');
      const searchRequestPromise = search.waitForSearchRequest();
      await search.performRecommendationSearch();
      const requestBody = (await searchRequestPromise).postDataJSON();
      expect(requestBody?.fieldsToInclude).toBeDefined();
      expect(requestBody).toEqual(
        expect.objectContaining({
          fieldsToInclude: expect.arrayContaining(expectedFieldsToInclude),
        })
      );
      expect(recommendationList.recommendationList).toBeVisible();
    });
  });
});
