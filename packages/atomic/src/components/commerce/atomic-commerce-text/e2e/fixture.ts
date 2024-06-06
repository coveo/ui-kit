import {
  AxeFixture,
  makeAxeBuilder,
} from '@coveo/atomic/playwrightUtils/base-fixture';
import {test as base} from '@playwright/test';
import {AtomicCommerceTextLocators as Text} from './page-object';

type MyFixtures = {
  text: Text;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  text: async ({page}, use) => {
    await use(new Text(page));
  },
});
export {expect} from '@playwright/test';
