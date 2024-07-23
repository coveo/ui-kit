import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {FacetsPageObject} from '../../../../commerce/facets/atomic-commerce-facets/e2e/page-object';
import {TabManagerPageObject} from './page-object';

interface TestFixture {
  facets: FacetsPageObject;
  tabManager: TabManagerPageObject;
}

export const test = base.extend<TestFixture & AxeFixture>({
  makeAxeBuilder,
  tabManager: async ({page}, use) => {
    await use(new TabManagerPageObject(page));
  },
  facets: async ({page}, use) => {
    await use(new FacetsPageObject(page));
  },
});
export {expect} from '@playwright/test';
