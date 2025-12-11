import {test as base} from '@playwright/test';
import {AtomicResultTablePlaceholderPageObject} from './page-object';

type MyFixtures = {
  placeholder: AtomicResultTablePlaceholderPageObject;
};

export const test = base.extend<MyFixtures>({
  placeholder: async ({page}, use) => {
    await use(new AtomicResultTablePlaceholderPageObject(page));
  },
});

export {expect} from '@playwright/test';
