import {test as base} from '@playwright/test';
import {AtomicAnswersThreadItemPageObject} from './page-object';

type Fixtures = {
  answersThreadItem: AtomicAnswersThreadItemPageObject;
};

export const test = base.extend<Fixtures>({
  answersThreadItem: async ({page}, use) => {
    await use(new AtomicAnswersThreadItemPageObject(page));
  },
});

export {expect} from '@playwright/test';
