import {test as base} from '@playwright/test';
import {AtomicSortExpressionPageObject} from './page-object';

type MyFixtures = {
  sortExpression: AtomicSortExpressionPageObject;
};

export const test = base.extend<MyFixtures>({
  sortExpression: async ({page}, use) => {
    await use(new AtomicSortExpressionPageObject(page));
  },
});
export {expect} from '@playwright/test';
