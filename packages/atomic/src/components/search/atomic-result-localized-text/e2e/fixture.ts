import {test as base} from '@playwright/test';
import {ResultPageObject as Result} from '@/src/components/search/atomic-result/e2e/page-object';
import {ResultLocalizedTextPageObject as ResultLocalizedText} from './page-object';

type MyFixtures = {
  resultLocalizedText: ResultLocalizedText;
  result: Result;
};

export const test = base.extend<MyFixtures>({
  resultLocalizedText: async ({page}, use) => {
    await use(new ResultLocalizedText(page));
  },
  result: async ({page}, use) => {
    await use(new Result(page));
  },
});

export {expect} from '@playwright/test';
