import {test as base} from '@playwright/test';
import {SegmentedFacetPageObject} from './page-object';

type MyFixtures = {
  segmentedFacet: SegmentedFacetPageObject;
};

export const test = base.extend<MyFixtures>({
  segmentedFacet: async ({page}, use) => {
    await use(new SegmentedFacetPageObject(page));
  },
});

export {expect} from '@playwright/test';
