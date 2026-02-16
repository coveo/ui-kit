import {test as base} from '@playwright/test';
import {AtomicFacetPageObject as FacetPageObject} from '@/src/components/search/atomic-facet/e2e/page-object';
import {SearchBoxPageObject} from '@/src/components/search/atomic-search-box/e2e/page-object';
import {TabManagerPageObject} from './page-object';

interface TestFixture {
  facets: FacetPageObject;
  tabManager: TabManagerPageObject;
  searchBox: SearchBoxPageObject;
}

export const test = base.extend<TestFixture>({
  tabManager: async ({page}, use) => {
    await use(new TabManagerPageObject(page));
  },
  facets: async ({page}, use) => {
    await use(new FacetPageObject(page));
  },
  searchBox: async ({page}, use) => {
    await use(new SearchBoxPageObject(page));
  },
});
export {expect} from '@playwright/test';
