import {PagerObject} from './page-object';
import {quanticBase} from '../../../../../../playwright/fixtures/base-fixture';

import {SearchObject} from '../../../../../../playwright/page-object/search-object';

type QuanticPagerE2EFixtures = {
  pager: PagerObject;
};

export const testSearch = quanticBase.extend<QuanticPagerE2EFixtures>({
  pager: async ({page}, use) => {
    await use(new PagerObject(page));
  },
  search: async ({page}, use) => {
    await use(new SearchObject(page, 'search'));
  },
});

export const testInsight = quanticBase.extend<QuanticPagerE2EFixtures>({
  pager: async ({page}, use) => {
    await use(new PagerObject(page));
  },
  search: async ({page}, use) => {
    await use(new SearchObject(page, 'insight'));
  },
});

export {expect} from '@playwright/test';
