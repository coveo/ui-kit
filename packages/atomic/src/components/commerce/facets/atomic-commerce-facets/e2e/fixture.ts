import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {FacetsPageObject} from './page-object';

interface TestFixture {
  facets: FacetsPageObject;
}

export const test = base.extend<TestFixture & AxeFixture>({
  makeAxeBuilder,
  facets: async ({page}, use) => {
    await use(new FacetsPageObject(page));
  },
});
export {expect} from '@playwright/test';
