import {test as base} from '@playwright/test';
import {AtomicAutomaticFacetPageObject as AutomaticFacet} from './page-object';

type MyFixture = {
  automaticFacet: AutomaticFacet;
};

export const test = base.extend<MyFixture>({
  automaticFacet: async ({page}, use) => {
    await use(new AutomaticFacet(page));
  },
});

export {expect} from '@playwright/test';
