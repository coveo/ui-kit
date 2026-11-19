import {test as base} from '@playwright/test';
import {interfaceConfigResponses} from '@coveo/platform-mock-api/insight';
import {ConfigurationObject} from '../page-object/configurationObject';
import {AnalyticsMode, AnalyticsModeEnum} from '../utils/analyticsMode';
import {AnalyticsObject} from '../page-object/analytics';
import {insightInterfaceRequestRegex} from '../utils/requests';

type QuanticBaseE2EFixtures = {
  configuration: ConfigurationObject;
  analyticsMode: AnalyticsMode;
  pageUrl: string;
  analytics: AnalyticsObject;
  /**
   * When `false` (default), the Insight interface config request is answered by a mock.
   * Set to `true` with `test.use` to send it to the real Insight API.
   */
  liveInsightConfig: boolean;
};

export const quanticBase = base.extend<QuanticBaseE2EFixtures>({
  pageUrl: '',
  analyticsMode: AnalyticsModeEnum.legacy,
  liveInsightConfig: [false, {option: true}],
  // Routing on the context covers every page of the test and is registered before any `page.goto`.
  context: async ({context, liveInsightConfig}, use) => {
    if (!liveInsightConfig) {
      await context.route(insightInterfaceRequestRegex, async (route) => {
        await route.fulfill({
          body: JSON.stringify(interfaceConfigResponses.baseResponse),
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        });
      });
    }
    await use(context);
  },
  configuration: async ({page}, use) => {
    await use(new ConfigurationObject(page));
  },
  analytics: async ({page, analyticsMode, baseURL, pageUrl}, use) => {
    if (analyticsMode === AnalyticsModeEnum.next) {
      await AnalyticsObject.setCookieToEnableNextAnalytics(
        page,
        `${baseURL}/${pageUrl}`
      );
    }
    await use(new AnalyticsObject(page, analyticsMode));
  },
});
