import {testSearch, expect} from './fixture';

let test = testSearch;

test.describe('quantic recent results list', () => {
  test.describe('when clicking on a recent result', () => {
    test('should log the custom UA analytics event', async ({
      recentResultList,
    }) => {
      await recentResultList.clickSelectResultButton();

      const firstRecentResultItemLink =
        recentResultList.getRecentResultLinkByIndex(0);
      await firstRecentResultItemLink.scrollIntoViewIfNeeded();
      expect(firstRecentResultItemLink).toBeVisible();
      expect(firstRecentResultItemLink).not.toBeNull();
      await firstRecentResultItemLink.evaluate((el) => {
        el.addEventListener('click', (e) => e.preventDefault());
      });

      const recentResultClickAnalyticsPromise =
        recentResultList.waitForRecentResultClickAnalytics({
          documentTitle: '1',
          documentUrl: 'https://github.com/coveo/ui-kit/',
        });
      await firstRecentResultItemLink.click();

      await recentResultClickAnalyticsPromise;
    });
  });
});
