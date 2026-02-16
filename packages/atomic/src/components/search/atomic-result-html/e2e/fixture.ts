import {test as base} from '@playwright/test';
import {ResultPageObject as Result} from '@/src/components/search/atomic-result/e2e/page-object';
import {AtomicResultHtmlPageObject as ResultHtml} from './page-object';

type MyFixtures = {
  resultHtml: ResultHtml;
  result: Result;
};

export const test = base.extend<MyFixtures>({
  resultHtml: async ({page}, use) => {
    await use(new ResultHtml(page));
  },
  result: async ({page}, use) => {
    await use(new Result(page));
  },
});

export {expect} from '@playwright/test';
