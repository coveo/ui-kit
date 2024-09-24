import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {ProductLinkPageObject} from './page-object';

type MyFixtures = {
  productLink: ProductLinkPageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  productLink: async ({page}, use) => {
    await use(new ProductLinkPageObject(page));
  },
});

export {expect} from '@playwright/test';
