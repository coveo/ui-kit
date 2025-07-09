import {test as base} from '@playwright/test';
import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicResultPageObject as Result} from '../../atomic-result/e2e/page-object';
import {SearchBoxPageObject as SearchBox} from '../../atomic-search-box/e2e/page-object';
import {AtomicResultListPageObject as ResultList} from '../../result-lists/atomic-result-list/e2e/page-object';
import {LoadMoreResultsPageObject as LoadMore} from './page-object';

type MyFixtures = {
  searchBox: SearchBox;
  loadMore: LoadMore;
  resultList: ResultList;
  result: Result;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  loadMore: async ({page}, use) => {
    await use(new LoadMore(page));
  },
  searchBox: async ({page}, use) => {
    await use(new SearchBox(page));
  },
  resultList: async ({page}, use) => {
    await use(new ResultList(page));
  },
  result: async ({page}, use) => {
    await use(new Result(page));
  },
});

export {expect} from '@playwright/test';
