import {test as base} from '@playwright/test';
import {AtomicSortDropdownPageObject} from './page-object';

type MyFixture = {
  sortDropdown: AtomicSortDropdownPageObject;
};

export const test = base.extend<MyFixture>({
  sortDropdown: async ({page}, use) => {
    await use(new AtomicSortDropdownPageObject(page));
  },
});

export {expect} from '@playwright/test';
