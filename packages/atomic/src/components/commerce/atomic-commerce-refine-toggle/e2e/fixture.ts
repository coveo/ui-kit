import {test as base} from '@playwright/test';
import {AtomicCommerceRefineTogglePageObject} from './page-object';

type Fixtures = {
  commerceRefineToggle: AtomicCommerceRefineTogglePageObject;
};

export const test = base.extend<Fixtures>({
  commerceRefineToggle: async ({page}, use) => {
    await use(new AtomicCommerceRefineTogglePageObject(page));
  },
});

export {expect} from '@playwright/test';
