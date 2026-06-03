import {test as base} from '@playwright/test';
import {InsightResultActionBarObject} from './page-object';

interface TestFixture {
  actionBar: InsightResultActionBarObject;
}

export const test = base.extend<TestFixture>({
  actionBar: async ({page}, use) => {
    await use(new InsightResultActionBarObject(page));
  },
});

export {expect} from '@playwright/test';
