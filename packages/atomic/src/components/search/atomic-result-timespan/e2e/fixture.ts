import {test as base} from '@playwright/test';
import {ResultTimespanPageObject} from './page-object';

type MyFixtures = {
  resultTimespan: ResultTimespanPageObject;
};

export const test = base.extend<MyFixtures>({
  resultTimespan: async ({page}, use) => {
    await use(new ResultTimespanPageObject(page));
  },
});

export {expect} from '@playwright/test';
