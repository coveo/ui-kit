import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicProductChildrenPageObject} from './page-object';

type Fixtures = {
  productChildren: AtomicProductChildrenPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  productChildren: async ({page}, use) => {
    await use(new AtomicProductChildrenPageObject(page));
  },
});

export {expect} from '@playwright/test';
