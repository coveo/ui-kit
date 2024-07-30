import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {CommerceInterfacePageObject as CommerceInterface} from './page-object';

type MyFixtures = {
  commerceInterface: CommerceInterface;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  commerceInterface: async ({page}, use) => {
    await use(new CommerceInterface(page));
  },
});
export {expect} from '@playwright/test';
