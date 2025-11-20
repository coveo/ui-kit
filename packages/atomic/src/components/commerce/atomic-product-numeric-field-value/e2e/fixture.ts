import {test as base} from '@playwright/test';
import {NumericFieldValuePageObject} from './page-object';

type MyFixtures = {
  numericFieldValue: NumericFieldValuePageObject;
};

export const test = base.extend<MyFixtures>({
  numericFieldValue: async ({page}, use) => {
    await use(new NumericFieldValuePageObject(page));
  },
});

export {expect} from '@playwright/test';
