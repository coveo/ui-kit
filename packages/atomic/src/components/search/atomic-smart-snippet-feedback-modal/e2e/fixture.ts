import {test as base} from '@playwright/test';
import {AtomicSmartSnippetFeedbackModalPageObject} from './page-object';

interface TestFixture {
  feedbackModal: AtomicSmartSnippetFeedbackModalPageObject;
}

export const test = base.extend<TestFixture>({
  feedbackModal: async ({page}, use) => {
    await use(new AtomicSmartSnippetFeedbackModalPageObject(page));
  },
});

export {expect} from '@playwright/test';
