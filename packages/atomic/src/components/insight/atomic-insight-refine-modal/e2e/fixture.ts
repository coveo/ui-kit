import {test as base} from '@playwright/test';
import {InsightRefineModalPageObject} from './page-object';

type Fixtures = {
  refineModal: InsightRefineModalPageObject;
};

export const test = base.extend<Fixtures>({
  refineModal: async ({page}, use) => {
    await use(new InsightRefineModalPageObject(page));
  },
});

export {expect} from '@playwright/test';
