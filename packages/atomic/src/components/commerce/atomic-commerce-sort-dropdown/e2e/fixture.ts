import {test as base} from '@playwright/test';
import {AtomicCommerceSortDropdownPageObject} from './page-object';

type Fixtures = {
  commerceSortDropdown: AtomicCommerceSortDropdownPageObject;
};

export const test = base.extend<Fixtures>({
  commerceSortDropdown: async ({page}, use) => {
    await use(new AtomicCommerceSortDropdownPageObject(page));
  },
});

export {expect} from '@playwright/test';
