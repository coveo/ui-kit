import {test as base} from '@playwright/test';
import {RecsResultTemplateObject} from './page-object';

interface TestFixture {
  recsResultTemplate: RecsResultTemplateObject;
}

export const test = base.extend<TestFixture>({
  recsResultTemplate: async ({page}, use) => {
    await use(new RecsResultTemplateObject(page));
  },
});

export {expect} from '@playwright/test';
