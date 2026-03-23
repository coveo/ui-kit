import {test as base} from '@playwright/test';
import {InsightResultChildrenTemplateObject} from './page-object';

interface TestFixture {
  resultChildrenTemplate: InsightResultChildrenTemplateObject;
}

export const test = base.extend<TestFixture>({
  resultChildrenTemplate: async ({page}, use) => {
    await use(new InsightResultChildrenTemplateObject(page));
  },
});

export {expect} from '@playwright/test';
