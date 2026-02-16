import {test as base} from '@playwright/test';
import {ResultMultiValueTextPageObject} from './page-object';

type MyFixtures = {
  resultMultiValueText: ResultMultiValueTextPageObject;
};

export const test = base.extend<MyFixtures>({
  resultMultiValueText: async ({page}, use) => {
    await use(new ResultMultiValueTextPageObject(page));
  },
});

export {expect} from '@playwright/test';
