import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {ResultRatingPageObject} from './page-object';

type MyFixtures = {
  resultRating: ResultRatingPageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  resultRating: async ({page}, use) => {
    await use(new ResultRatingPageObject(page));
  },
});

export {expect} from '@playwright/test';
