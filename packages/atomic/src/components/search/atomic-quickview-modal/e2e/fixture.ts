import {test as base} from '@playwright/test';
import {QuickviewModalPageObject} from './page-object';

interface QuickviewModalFixture {
  quickviewModal: QuickviewModalPageObject;
}

export const test = base.extend<QuickviewModalFixture>({
  quickviewModal: async ({page}, use) => {
    await use(new QuickviewModalPageObject(page));
  },
});

export {expect} from '@playwright/test';
