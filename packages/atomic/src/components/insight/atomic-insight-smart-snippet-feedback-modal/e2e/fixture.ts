import {test as base} from '@playwright/test';
import {AtomicInsightSmartSnippetFeedbackModalPageObject} from './page-object';

interface TestFixture {
  feedbackModal: AtomicInsightSmartSnippetFeedbackModalPageObject;
}

export const test = base.extend<TestFixture>({
  feedbackModal: async ({page}, use) => {
    await use(new AtomicInsightSmartSnippetFeedbackModalPageObject(page));
  },
});

export {expect} from '@playwright/test';
