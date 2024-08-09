import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {AtomicFacetPageObject as FacetPageObject} from '../../../facets/atomic-facet/e2e/page-object';
import {TabManagerPageObject} from './page-object';

interface TestFixture {
  facets: FacetPageObject;
  tabManager: TabManagerPageObject;
}

export const test = base.extend<TestFixture & AxeFixture>({
  makeAxeBuilder,
  tabManager: async ({page}, use) => {
    await use(new TabManagerPageObject(page));
  },
  facets: async ({page}, use) => {
    await use(new FacetPageObject(page));
  },
});
export {expect} from '@playwright/test';
