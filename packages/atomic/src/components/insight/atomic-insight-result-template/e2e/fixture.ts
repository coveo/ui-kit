import {test as base} from '@playwright/test';
import {InsightResultTemplateObject} from './page-object';

interface TestFixture {
  resultTemplate: InsightResultTemplateObject;
}

export const test = base.extend<TestFixture>({
  resultTemplate: async ({page}, use) => {
    await use(new InsightResultTemplateObject(page));
  },
});

export {expect} from '@playwright/test';
