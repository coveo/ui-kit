import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicSearchInterfacePageObject} from './page-object';

type Fixtures = {
  searchInterface: AtomicSearchInterfacePageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  searchInterface: async ({page}, use) => {
    await use(new AtomicSearchInterfacePageObject(page));
  },
});

export {expect} from '@playwright/test';
