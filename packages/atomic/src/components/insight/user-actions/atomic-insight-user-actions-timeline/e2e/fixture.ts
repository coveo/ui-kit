import {test as base} from '@playwright/test';
import {UserActionsTimelinePageObject} from './page-object';

type AtomicInsightUserActionsTimelineE2EFixtures = {
  userActionsTimeline: UserActionsTimelinePageObject;
};

export const test = base.extend<AtomicInsightUserActionsTimelineE2EFixtures>({
  userActionsTimeline: async ({page}, use) => {
    await use(new UserActionsTimelinePageObject(page));
  },
});

export {expect} from '@playwright/test';
