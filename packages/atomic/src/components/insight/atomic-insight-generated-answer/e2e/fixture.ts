import {test as base} from '@playwright/test';
import {InsightGeneratedAnswerPageObject} from './page-object';

type AtomicInsightGeneratedAnswerE2EFixtures = {
  generatedAnswer: InsightGeneratedAnswerPageObject;
};

export const test = base.extend<AtomicInsightGeneratedAnswerE2EFixtures>({
  generatedAnswer: async ({page}, use) => {
    await use(new InsightGeneratedAnswerPageObject(page));
  },
});

export {expect} from '@playwright/test';
