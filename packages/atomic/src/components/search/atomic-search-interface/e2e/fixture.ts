import {test as base} from '@playwright/test';
import {AtomicSearchInterfacePageObject} from './page-object';

type Fixtures = {
  searchInterface: AtomicSearchInterfacePageObject;
};

export const test = base.extend<Fixtures>({
  searchInterface: async ({page}, use) => {
    await use(new AtomicSearchInterfacePageObject(page));
  },
});

export {expect} from '@playwright/test';
