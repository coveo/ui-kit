import {test as base} from '@playwright/test';
import {ResultChildrenObject} from './page-object';

interface TestFixture {
  resultChildren: ResultChildrenObject;
}

export const test = base.extend<TestFixture>({
  resultChildren: async ({page}, use) => {
    await use(new ResultChildrenObject(page));
  },
});

export {expect} from '@playwright/test';
