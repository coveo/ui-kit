import {test as base} from '@playwright/test';
import {AtomicResultNumberPageObject} from './page-object';

type Fixtures = {
  resultNumber: AtomicResultNumberPageObject;
};

export const test = base.extend<Fixtures>({
  resultNumber: async ({page}, use) => {
    await use(new AtomicResultNumberPageObject(page));
  },
});

export {expect} from '@playwright/test';
