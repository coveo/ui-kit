import {test as base} from '@playwright/test';
import {ConfigurationObject} from '../page-object/configurationObject';
import {AnalyticsMode, AnalyticsModeEnum} from '../utils/analyticsMode';
import {AnalyticsObject} from '../page-object/analytics';

type QuanticBaseE2EFixtures = {
  configuration: ConfigurationObject;
  analyticsMode: AnalyticsMode;
  pageUrl: string;
  analytics: AnalyticsObject;
};

export const quanticBase = base.extend<QuanticBaseE2EFixtures>({
  pageUrl: '',
  analyticsMode: AnalyticsModeEnum.legacy,
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
