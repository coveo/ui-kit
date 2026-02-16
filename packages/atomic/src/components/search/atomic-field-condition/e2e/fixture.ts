import {test as base} from '@playwright/test';
import {FieldConditionPageObject as FieldCondition} from './page-object';

type Fixtures = {
  fieldCondition: FieldCondition;
};

export const test = base.extend<Fixtures>({
  fieldCondition: async ({page}, use) => {
    await use(new FieldCondition(page));
  },
});

export {expect} from '@playwright/test';
