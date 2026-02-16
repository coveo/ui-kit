import {test as base} from '@playwright/test';
import {ResultRatingPageObject} from './page-object';

type MyFixtures = {
  resultRating: ResultRatingPageObject;
};

export const test = base.extend<MyFixtures>({
  resultRating: async ({page}, use) => {
    await use(new ResultRatingPageObject(page));
  },
});

export {expect} from '@playwright/test';
