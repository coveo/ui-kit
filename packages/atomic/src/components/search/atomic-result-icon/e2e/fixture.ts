import {test as base} from '@playwright/test';
import {ResultIconPageObject} from './page-object';

type MyFixtures = {
  resultIcon: ResultIconPageObject;
};

export const test = base.extend<MyFixtures>({
  resultIcon: async ({page}, use) => {
    await use(new ResultIconPageObject(page));
  },
});

export {expect} from '@playwright/test';
