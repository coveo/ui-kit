import {test as base} from '@playwright/test';
import {AtomicCommerceInterfacePageObject} from './page-object';

type Fixtures = {
  commerceInterface: AtomicCommerceInterfacePageObject;
};

export const test = base.extend<Fixtures>({
  commerceInterface: async ({page}, use) => {
    await use(new AtomicCommerceInterfacePageObject(page));
  },
});

export {expect} from '@playwright/test';
