import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {UserActionsTogglePageObject} from './page-object';

type AtomicInsightUserActionsToggleE2EFixtures = {
  userActionsToggle: UserActionsTogglePageObject;
};

export const test = base.extend<
  AtomicInsightUserActionsToggleE2EFixtures & AxeFixture
>({
  makeAxeBuilder,
  userActionsToggle: async ({page}, use) => {
    await use(new UserActionsTogglePageObject(page));
  },
});

export {expect} from '@playwright/test';
