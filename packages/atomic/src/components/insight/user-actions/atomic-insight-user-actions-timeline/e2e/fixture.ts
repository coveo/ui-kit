import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {UserActionsTimelinePageObject} from './page-object';

type AtomicInsightUserActionsTimelineE2EFixtures = {
  userActionsTimeline: UserActionsTimelinePageObject;
};

export const test = base.extend<
  AtomicInsightUserActionsTimelineE2EFixtures & AxeFixture
>({
  makeAxeBuilder,
  userActionsTimeline: async ({page}, use) => {
    await use(new UserActionsTimelinePageObject(page));
  },
});

export {expect} from '@playwright/test';
