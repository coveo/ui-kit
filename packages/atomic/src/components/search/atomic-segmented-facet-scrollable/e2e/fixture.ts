import {test as base} from '@playwright/test';
import {SegmentedFacetScrollablePageObject} from './page-object';

type MyFixtures = {
  segmentedFacetScrollable: SegmentedFacetScrollablePageObject;
};

export const test = base.extend<MyFixtures>({
  segmentedFacetScrollable: async ({page}, use) => {
    await use(new SegmentedFacetScrollablePageObject(page));
  },
});

export {expect} from '@playwright/test';
