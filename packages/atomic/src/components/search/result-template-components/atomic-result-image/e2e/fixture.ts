import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {ResultImageObject} from './page-object';

interface TestFixture {
  resultImage: ResultImageObject;
}

export const test = base.extend<TestFixture & AxeFixture>({
  makeAxeBuilder,
  resultImage: async ({page}, use) => {
    await use(new ResultImageObject(page));
  },
});

export {expect} from '@playwright/test';
