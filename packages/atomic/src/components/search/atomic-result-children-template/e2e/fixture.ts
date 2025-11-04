import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {ResultChildrenTemplateObject} from './page-object';

interface TestFixture {
  resultChildrenTemplate: ResultChildrenTemplateObject;
}
export const test = base.extend<TestFixture & AxeFixture>({
  makeAxeBuilder,
  resultChildrenTemplate: async ({page}, use) => {
    await use(new ResultChildrenTemplateObject(page));
  },
});
export {expect} from '@playwright/test';
