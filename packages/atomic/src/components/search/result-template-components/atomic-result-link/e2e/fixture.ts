import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {ResultLinkPageObject} from './page-object';

type MyFixtures = {
  resultLink: ResultLinkPageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  resultLink: async ({page}, use) => {
    await use(new ResultLinkPageObject(page));
  },
});

export {expect} from '@playwright/test';
