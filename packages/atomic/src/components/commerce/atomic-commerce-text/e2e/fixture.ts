import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {AtomicCommerceText as Text} from './page-object';

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
