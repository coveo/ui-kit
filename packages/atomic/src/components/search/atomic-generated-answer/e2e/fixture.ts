import {test as base} from '@playwright/test';
import {SearchBoxPageObject as SearchBox} from '../../atomic-search-box/e2e/page-object';
import {GeneratedAnswerPageObject as GeneratedAnswer} from './page-object';

type MyFixtures = {
  generatedAnswer: GeneratedAnswer;
  searchBox: SearchBox;
};

export const test = base.extend<MyFixtures>({
  generatedAnswer: async ({page}, use) => {
    await use(new GeneratedAnswer(page));
  },

  searchBox: async ({page}, use) => {
    await use(new SearchBox(page));
  },
});

export {expect} from '@playwright/test';
