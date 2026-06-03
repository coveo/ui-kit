import {test as base} from '@playwright/test';
import {IpxRefineModalPageObject} from './page-object';

type RefineModalFixtures = {
  refineModal: IpxRefineModalPageObject;
};

export const test = base.extend<RefineModalFixtures>({
  refineModal: async ({page}, use) => {
    await use(new IpxRefineModalPageObject(page));
  },
});

export {expect} from '@playwright/test';
