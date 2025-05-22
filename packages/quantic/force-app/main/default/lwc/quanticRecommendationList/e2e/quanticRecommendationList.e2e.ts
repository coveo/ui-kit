import {testSearch} from './fixture';

const fixtures = {
  search: testSearch,
};

let test = fixtures.search;

test.describe('quantic recommendation list', () => {
  test.describe('when clicking a recommendation', () => {
    test('should log recommendation open analytics', async ({
      recommendationList,
      page,
    }) => {
      // Hack(?) to be able to read the payload of the analytics click event.
      await page.route('*analytics*', (route) => {
        route.continue();
      });

      const recommendationClickAnalyticsPromise =
        recommendationList.waitForRecommendationListClickEvent(
          'recommendationOpen'
        );

      const firstRecommendationLink =
        recommendationList.firstRecommendationLink;
      firstRecommendationLink.scrollIntoViewIfNeeded();
      await firstRecommendationLink.evaluate((el) =>
        el.setAttribute('href', '#')
      );
      await firstRecommendationLink.click();

      await recommendationClickAnalyticsPromise;
    });
  });
});
