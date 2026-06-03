import {test as base} from '@playwright/test';
import {QueryErrorPageObject} from './page-object';

type MyFixtures = {
  queryError: QueryErrorPageObject;
};

export const test = base.extend<MyFixtures>({
  queryError: async ({page}, use) => {
    await use(new QueryErrorPageObject(page));
  },
});

export {expect} from '@playwright/test';
