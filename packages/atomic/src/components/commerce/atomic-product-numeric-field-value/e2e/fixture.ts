import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {NumericFieldValuePageObject} from './page-object';

type MyFixtures = {
  numericFieldValue: NumericFieldValuePageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  numericFieldValue: async ({page}, use) => {
    await use(new NumericFieldValuePageObject(page));
  },
});

export {expect} from '@playwright/test';
