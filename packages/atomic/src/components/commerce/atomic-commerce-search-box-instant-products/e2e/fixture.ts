import {test as base} from '@playwright/test';
import {SearchBoxPageObject} from '../../atomic-commerce-search-box/e2e/page-object';
import {InstantProductPageObject} from './page-object';

type Fixture = {
  searchBox: SearchBoxPageObject;
  instantProduct: InstantProductPageObject;
};

export const test = base.extend<Fixture>({
  instantProduct: async ({page}, use) => {
    await use(new InstantProductPageObject(page));
  },
  searchBox: async ({page}, use) => {
    await use(new SearchBoxPageObject(page));
  },
});

export {expect} from '@playwright/test';
