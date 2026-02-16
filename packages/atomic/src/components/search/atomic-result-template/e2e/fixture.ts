import {test as base} from '@playwright/test';
import {ResultTemplateObject} from './page-object';

interface TestFixture {
  resultTemplate: ResultTemplateObject;
}
export const test = base.extend<TestFixture>({
  resultTemplate: async ({page}, use) => {
    await use(new ResultTemplateObject(page));
  },
});
export {expect} from '@playwright/test';
