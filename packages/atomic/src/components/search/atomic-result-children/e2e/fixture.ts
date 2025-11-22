import {test as base} from '@playwright/test';
import {AtomicResultChildrenPageObject} from './page-object';

type Fixtures = {
  resultChildren: AtomicResultChildrenPageObject;
};

export const test = base.extend<Fixtures>({
  resultChildren: async ({page}, use) => {
    await use(new AtomicResultChildrenPageObject(page));
  },
});

export {expect} from '@playwright/test';
