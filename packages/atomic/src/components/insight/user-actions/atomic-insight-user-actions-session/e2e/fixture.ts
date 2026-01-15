import {test as base} from '@playwright/test';
import {UserActionsSessionPageObject} from './page-object';

type AtomicInsightUserActionsSessionE2EFixtures = {
  userActionsSession: UserActionsSessionPageObject;
};

export const test = base.extend<AtomicInsightUserActionsSessionE2EFixtures>({
  userActionsSession: async ({page}, use) => {
    await use(new UserActionsSessionPageObject(page));
  },
});

export {expect} from '@playwright/test';
