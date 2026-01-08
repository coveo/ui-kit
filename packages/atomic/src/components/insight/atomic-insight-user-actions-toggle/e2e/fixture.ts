import {test as base} from '@playwright/test';
import {UserActionsTogglePageObject} from './page-object';

type AtomicInsightUserActionsToggleE2EFixtures = {
  userActionsToggle: UserActionsTogglePageObject;
};

export const test = base.extend<AtomicInsightUserActionsToggleE2EFixtures>({
  userActionsToggle: async ({page}, use) => {
    await use(new UserActionsTogglePageObject(page));
  },
});

export {expect} from '@playwright/test';
