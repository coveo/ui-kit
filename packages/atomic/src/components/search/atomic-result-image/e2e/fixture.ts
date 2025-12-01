import {test as base} from '@playwright/test';
import {ResultImageObject} from './page-object';

interface TestFixture {
  resultImage: ResultImageObject;
}

export const test = base.extend<TestFixture>({
  resultImage: async ({page}, use) => {
    await use(new ResultImageObject(page));
  },
});

export {expect} from '@playwright/test';
