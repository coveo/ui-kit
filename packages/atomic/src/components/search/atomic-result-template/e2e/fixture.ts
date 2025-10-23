import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {ResultTemplateObject} from './page-object';

interface TestFixture {
  resultTemplate: ResultTemplateObject;
}
export const test = base.extend<TestFixture & AxeFixture>({
  makeAxeBuilder,
  resultTemplate: async ({page}, use) => {
    await use(new ResultTemplateObject(page));
  },
});
export {expect} from '@playwright/test';
