import {test as base} from '@playwright/test';
import {AtomicProductChildrenPageObject} from './page-object';

type Fixtures = {
  productChildren: AtomicProductChildrenPageObject;
};

export const test = base.extend<Fixtures>({
  productChildren: async ({page}, use) => {
    await use(new AtomicProductChildrenPageObject(page));
  },
});

export {expect} from '@playwright/test';
