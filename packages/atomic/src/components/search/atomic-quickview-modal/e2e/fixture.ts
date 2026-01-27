import {test as base} from '@playwright/test';
import {QuickviewModalPageObject} from './page-object';

type Fixtures = {
  quickviewModal: QuickviewModalPageObject;
};

export const test = base.extend<Fixtures>({
  quickviewModal: async ({page}, use) => {
    await use(new QuickviewModalPageObject(page));
  },
});

export {expect} from '@playwright/test';
