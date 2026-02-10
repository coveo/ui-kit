import {test as base} from '@playwright/test';
import {AnswersThreadItemPageObject as AnswersThreadItem} from './page-object';

type AnswersThreadItemFixtures = {
  answersThreadItem: AnswersThreadItem;
};

export const test = base.extend<AnswersThreadItemFixtures>({
  answersThreadItem: async ({page}, use) => {
    await use(new AnswersThreadItem(page));
  },
});

export {expect} from '@playwright/test';
