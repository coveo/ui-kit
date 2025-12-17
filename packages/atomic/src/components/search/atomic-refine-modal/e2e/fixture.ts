import {test as base} from '@playwright/test';
import {RefineModalPageObject} from './page-object';

type Fixtures = {
  refineModal: RefineModalPageObject;
};

export const test = base.extend<Fixtures>({
  refineModal: async ({page}, use) => {
    await use(new RefineModalPageObject(page));
  },
});

export {expect} from '@playwright/test';
