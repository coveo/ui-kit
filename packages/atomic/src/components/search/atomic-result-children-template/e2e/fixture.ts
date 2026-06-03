import {test as base} from '@playwright/test';
import {ResultChildrenTemplateObject} from './page-object';

interface TestFixture {
  resultChildrenTemplate: ResultChildrenTemplateObject;
}
export const test = base.extend<TestFixture>({
  resultChildrenTemplate: async ({page}, use) => {
    await use(new ResultChildrenTemplateObject(page));
  },
});
export {expect} from '@playwright/test';
