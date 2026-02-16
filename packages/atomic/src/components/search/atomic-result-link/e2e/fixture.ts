import {test as base} from '@playwright/test';
import {ResultLinkPageObject} from './page-object';

type MyFixtures = {
  resultLink: ResultLinkPageObject;
};

export const test = base.extend<MyFixtures>({
  resultLink: async ({page}, use) => {
    await use(new ResultLinkPageObject(page));
  },
});

export {expect} from '@playwright/test';
