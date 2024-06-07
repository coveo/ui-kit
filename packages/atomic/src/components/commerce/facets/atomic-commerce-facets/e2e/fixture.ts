import {
  AxeFixture,
  makeAxeBuilder,
} from '@coveo/atomic/playwrightUtils/base-fixture';
import {test as base} from '@playwright/test';
import {AtomicCommerceFacets as Facets} from './page-object';

interface TestFixture {
  facets: Facets;
}

export const test = base.extend<TestFixture & AxeFixture>({
  makeAxeBuilder,
  facets: async ({page}, use) => {
    await use(new Facets(page));
  },
});
export {expect} from '@playwright/test';
