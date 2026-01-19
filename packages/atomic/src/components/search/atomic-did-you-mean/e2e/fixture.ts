import {test as base} from '@playwright/test';
import {SearchBoxPageObject} from '@/src/components/search/atomic-search-box/e2e/page-object';
import {DidYouMeanPageObject} from './page-object';

interface TestFixture {
  didYouMean: DidYouMeanPageObject;
  searchBox: SearchBoxPageObject;
}
export const test = base.extend<TestFixture>({
  didYouMean: async ({page}, use) => {
    await use(new DidYouMeanPageObject(page));
  },
  searchBox: async ({page}, use) => {
    await use(new SearchBoxPageObject(page));
  },
});
export {expect} from '@playwright/test';
