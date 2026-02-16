import {test as base} from '@playwright/test';
import {AtomicCommerceTimeframeFacetPageObject} from './page-object';

type Fixtures = {
  commerceTimeframeFacet: AtomicCommerceTimeframeFacetPageObject;
};

export const test = base.extend<Fixtures>({
  commerceTimeframeFacet: async ({page}, use) => {
    await use(new AtomicCommerceTimeframeFacetPageObject(page));
  },
});

export {expect} from '@playwright/test';
