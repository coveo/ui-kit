import {test as base} from '@playwright/test';
import {AtomicInsightResultAttachToCaseIndicatorPageObject} from './page-object';

type AtomicInsightResultAttachToCaseIndicatorE2EFixtures = {
  attachToCaseIndicator: AtomicInsightResultAttachToCaseIndicatorPageObject;
};

export const test =
  base.extend<AtomicInsightResultAttachToCaseIndicatorE2EFixtures>({
    attachToCaseIndicator: async ({page}, use) => {
      await use(new AtomicInsightResultAttachToCaseIndicatorPageObject(page));
    },
  });

export {expect} from '@playwright/test';
