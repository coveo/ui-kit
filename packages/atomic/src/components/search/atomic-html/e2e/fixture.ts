import {test as base} from '@playwright/test';
import {AtomicHtmlPageObject} from './page-object';

type Fixtures = {
  html: AtomicHtmlPageObject;
};

export const test = base.extend<Fixtures>({
  html: async ({page}, use) => {
    await use(new AtomicHtmlPageObject(page));
  },
});

export {expect} from '@playwright/test';
