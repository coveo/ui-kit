import {test as base} from '@playwright/test';
import {
  type AxeFixture,
  makeCustomAxeBuilder,
} from '@/playwright-utils/base-fixture';
import {AtomicCommerceRecommendationInterfacePageObject} from './page-object';

type Fixtures = {
  commerceRecommendationInterface: AtomicCommerceRecommendationInterfacePageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder: makeCustomAxeBuilder(
    'atomic-commerce-recommendation-interface'
  ),
  commerceRecommendationInterface: async ({page}, use) => {
    await use(new AtomicCommerceRecommendationInterfacePageObject(page));
  },
});

export {expect} from '@playwright/test';
