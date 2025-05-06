import {NotificationsObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {
  insightSearchRequestRegex,
  searchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';

import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {SearchObjectWithNotifyTrigger} from '../../../../../../playwright/page-object/searchObjectWithNotificationsTriggers';

const pageUrl = 's/quantic-notifications';

type QuanticNotificationsE2ESearchFixtures = {
  notifications: NotificationsObject;
  search: SearchObjectWithNotifyTrigger;
};

type QuanticNotificationsE2EInsightFixtures =
  QuanticNotificationsE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticNotificationsE2ESearchFixtures>({
    search: async ({page}, use) => {
      await use(new SearchObjectWithNotifyTrigger(page, searchRequestRegex));
    },
    notifications: async ({page, configuration, search}, use) => {
      await page.goto(pageUrl);
      configuration.configure();
      await search.waitForSearchResponse();
      await use(new NotificationsObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticNotificationsE2EInsightFixtures>({
    notificationsMessages: [],
    search: async ({page}, use) => {
      await use(
        new SearchObjectWithNotifyTrigger(page, insightSearchRequestRegex)
      );
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    notifications: async ({page, search, configuration, insightSetup}, use) => {
      await page.goto(pageUrl);
      configuration.configure({useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(new NotificationsObject(page));
    },
  });

export {expect} from '@playwright/test';
