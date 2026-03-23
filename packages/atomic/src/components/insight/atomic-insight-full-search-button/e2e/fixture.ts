import {test as base} from '@playwright/test';
import {FullSearchButtonPageObject} from './page-object';

type AtomicInsightFullSearchButtonE2EFixtures = {
  fullSearchButton: FullSearchButtonPageObject;
};

export const test = base.extend<AtomicInsightFullSearchButtonE2EFixtures>({
  fullSearchButton: async ({page}, use) => {
    await use(new FullSearchButtonPageObject(page));
  },
});

export {expect} from '@playwright/test';
