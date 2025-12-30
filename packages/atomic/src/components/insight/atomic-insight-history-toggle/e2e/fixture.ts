import {test as base} from '@playwright/test';
import {HistoryTogglePageObject} from './page-object';

type AtomicInsightHistoryToggleE2EFixtures = {
  historyToggle: HistoryTogglePageObject;
};

export const test = base.extend<AtomicInsightHistoryToggleE2EFixtures>({
  historyToggle: async ({page}, use) => {
    await use(new HistoryTogglePageObject(page));
  },
});

export {expect} from '@playwright/test';
