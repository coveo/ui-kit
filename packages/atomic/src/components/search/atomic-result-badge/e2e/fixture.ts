import {test as base} from '@playwright/test';
import {ResultBadgePageObject as ResultBadge} from './page-object';

type MyFixtures = {
  resultBadge: ResultBadge;
};

export const test = base.extend<MyFixtures>({
  resultBadge: async ({page}, use) => {
    await use(new ResultBadge(page));
  },
});

export {expect} from '@playwright/test';
