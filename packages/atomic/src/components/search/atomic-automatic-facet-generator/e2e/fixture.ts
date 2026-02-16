import {test as base} from '@playwright/test';
import {AtomicAutomaticFacetGeneratorPageObject as AutomaticFacetGenerator} from './page-object';

type MyFixture = {
  automaticFacetGenerator: AutomaticFacetGenerator;
};

export const test = base.extend<MyFixture>({
  automaticFacetGenerator: async ({page}, use) => {
    await use(new AutomaticFacetGenerator(page));
  },
});

export {expect} from '@playwright/test';
