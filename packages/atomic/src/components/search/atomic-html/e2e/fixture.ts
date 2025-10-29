import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicHtmlPageObject} from './page-object';

type Fixtures = {
  html: AtomicHtmlPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  html: async ({page}, use) => {
    await use(new AtomicHtmlPageObject(page));
  },
});

export {expect} from '@playwright/test';
