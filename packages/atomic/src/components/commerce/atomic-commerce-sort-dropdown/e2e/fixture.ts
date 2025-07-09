import {test as base} from '@playwright/test';
import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicCommerceSortDropdownPageObject} from './page-object';

type Fixtures = {
  commerceSortDropdown: AtomicCommerceSortDropdownPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  commerceSortDropdown: async ({page}, use) => {
    await use(new AtomicCommerceSortDropdownPageObject(page));
  },
});

export {expect} from '@playwright/test';
