import {test as base} from '@playwright/test';
import {RenderAnswersThreadItemPageObject} from './page-object';

type Fixtures = {
  answersThreadItem: RenderAnswersThreadItemPageObject;
};

export const test = base.extend<Fixtures>({
  answersThreadItem: async ({page}, use) => {
    await use(new RenderAnswersThreadItemPageObject(page));
  },
});

export {expect} from '@playwright/test';
