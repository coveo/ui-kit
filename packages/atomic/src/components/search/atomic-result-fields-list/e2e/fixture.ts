import {test as base} from '@playwright/test';
import {ResultFieldsListPageObject as ResultFieldsList} from './page-object';

type MyFixtures = {
  resultFieldsList: ResultFieldsList;
};

export const test = base.extend<MyFixtures>({
  resultFieldsList: async ({page}, use) => {
    await use(new ResultFieldsList(page));
  },
});

export {expect} from '@playwright/test';
