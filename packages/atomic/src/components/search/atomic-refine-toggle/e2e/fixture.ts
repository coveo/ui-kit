import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {RefineModalPageObject} from '../../atomic-refine-modal/e2e/page-object';
import {AtomicFacetPageObject} from '../../facets/atomic-facet/e2e/page-object';
import {RefineTogglePageObject} from './page-object';

type MyFixtures = {
  refineToggle: RefineTogglePageObject;
  refineModal: RefineModalPageObject;
  facet: AtomicFacetPageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  refineToggle: async ({page}, use) => {
    await use(new RefineTogglePageObject(page));
  },
  refineModal: async ({page}, use) => {
    await use(new RefineModalPageObject(page));
  },
  facet: async ({page}, use) => {
    await use(new AtomicFacetPageObject(page));
  },
});

export {expect} from '@playwright/test';
