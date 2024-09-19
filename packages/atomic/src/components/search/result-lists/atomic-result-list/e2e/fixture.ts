import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {AtomicResultPageObject as Result} from '../../../atomic-result/e2e/page-object';
import {AtomicResultListPageObject as ResultList} from './page-object';

type Fixture = {
  resultList: ResultList;
  result: Result;
};

export const test = base.extend<Fixture & AxeFixture>({
  makeAxeBuilder,
  resultList: async ({page}, use) => {
    await use(new ResultList(page));
  },
  result: async ({page}, use) => {
    await use(new Result(page));
  },
});

export {expect} from '@playwright/test';
