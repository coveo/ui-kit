import {test as base} from '@playwright/test';
import {AtomicCommerceDidYouMeanPageObject} from './page-object';

type Fixtures = {
  commerceDidYouMean: AtomicCommerceDidYouMeanPageObject;
};

export const test = base.extend<Fixtures>({
  commerceDidYouMean: async ({page}, use) => {
    await use(new AtomicCommerceDidYouMeanPageObject(page));
  },
});

export {expect} from '@playwright/test';
