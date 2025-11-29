import {test as base} from '@playwright/test';
import {ResultPageObject as Result} from '@/src/components/search/atomic-result/e2e/page-object';
import {ResultDatePageObject as ResultDate} from './page-object';

type MyFixtures = {
  resultDate: ResultDate;
  result: Result;
};

export const test = base.extend<MyFixtures>({
  resultDate: async ({page}, use) => {
    await use(new ResultDate(page));
  },
  result: async ({page}, use) => {
    await use(new Result(page));
  },
});

export {expect} from '@playwright/test';
