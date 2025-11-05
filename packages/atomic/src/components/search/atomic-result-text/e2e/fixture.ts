import {test as base} from '@playwright/test';
import {ResultPageObject as Result} from '@/src/components/search/atomic-result/e2e/page-object';
import {ResultTextPageObject as ResultText} from './page-object';

type MyFixtures = {
  resultText: ResultText;
  result: Result;
};

export const test = base.extend<MyFixtures>({
  resultText: async ({page}, use) => {
    await use(new ResultText(page));
  },
  result: async ({page}, use) => {
    await use(new Result(page));
  },
});

export {expect} from '@playwright/test';
