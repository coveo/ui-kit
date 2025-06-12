import {testSearch, expect} from './fixture';
import {
  AnalyticsModeEnum,
  analyticsModeTest,
} from '../../../../../../playwright/utils/analyticsMode';

let test = testSearch;

// Next analytics mode not supported in recent results list.
const supportedAnalyticsModes = analyticsModeTest.filter(
  (analyticsProtocol) => analyticsProtocol.mode === AnalyticsModeEnum.legacy
);

test.describe('quantic recent results list', () => {
  supportedAnalyticsModes.forEach((analytics) => {
    test.describe(analytics.label, () => {
      test.use({
        analyticsMode: analytics.mode,
      });

      test.describe('when clicking on a recent result', () => {
        test('should log the custom recent result click analytics event', async ({
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
  });
});
