import {test as base} from '@playwright/test';
import {FacetsPageObject} from './page-object';

interface TestFixture {
  facets: FacetsPageObject;
}

export const test = base.extend<TestFixture>({
  facets: async ({page}, use) => {
    await use(new FacetsPageObject(page));
  },
});
export {expect} from '@playwright/test';
