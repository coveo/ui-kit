import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {AtomicSortDropdownPageObject} from './page-object';

type MyFixture = {
  sortDropdown: AtomicSortDropdownPageObject;
};

export const test = base.extend<MyFixture & AxeFixture>({
  makeAxeBuilder,
  sortDropdown: async ({page}, use) => {
    await use(new AtomicSortDropdownPageObject(page));
  },
});

export {expect} from '@playwright/test';
