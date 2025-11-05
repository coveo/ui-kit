import {test as base} from '@playwright/test';
import {ResultPageObject as Result} from '@/src/components/search/atomic-result/e2e/page-object';
import {ResultListPageObject as ResultList} from '@/src/components/search/atomic-result-list/e2e/page-object';
import {SearchBoxPageObject as SearchBox} from '@/src/components/search/atomic-search-box/e2e/page-object';
import {LoadMoreResultsPageObject as LoadMore} from './page-object';

type MyFixtures = {
  searchBox: SearchBox;
  loadMore: LoadMore;
  resultList: ResultList;
  result: Result;
};

export const test = base.extend<MyFixtures>({
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
