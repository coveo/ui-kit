import {test as base} from '@playwright/test';
import {AtomicSegmentedFacetPageObject as SegmentedFacet} from './page-object';

type MyFixture = {
  segmentedFacet: SegmentedFacet;
};

export const test = base.extend<MyFixture>({
  segmentedFacet: async ({page}, use) => {
    await use(new SegmentedFacet(page));
  },
});

export {expect} from '@playwright/test';
