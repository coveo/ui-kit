import {test as base} from '@playwright/test';
import {ProductFieldConditionPageObject as ProductFieldCondition} from './page-object';

type Fixtures = {
  productFieldCondition: ProductFieldCondition;
};

export const test = base.extend<Fixtures>({
  productFieldCondition: async ({page}, use) => {
    await use(new ProductFieldCondition(page));
  },
});

export {expect} from '@playwright/test';
