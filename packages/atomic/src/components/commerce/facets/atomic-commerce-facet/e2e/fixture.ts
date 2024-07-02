import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {FacetPageObject} from './page-object';

type MyFixtures = {
  facet: FacetPageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  facet: async ({page}, use) => {
    await use(new FacetPageObject(page));
  },
});

export {expect} from '@playwright/test';
