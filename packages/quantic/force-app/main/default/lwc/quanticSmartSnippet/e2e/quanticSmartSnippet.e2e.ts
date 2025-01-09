import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const maximumSnippetHeight = 250;

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic smart snippet ${useCase.label}`, () => {
    test.use({
      options: {maximumSnippetHeight},
    });

    test.describe('when the smart snippet is expanded', () => {
      test.describe('when the source title is clicked', () => {
        test('should send the correct UA analytics event', async ({
          smartSnippet,
        }) => {
          await smartSnippet.smartSnippetSourceTitle.click();
          await smartSnippet.waitForSmartSnippetClickUaAnalytics(
            'openSmartSnippetSource'
          );
        });
      });
      test.describe('when the source uri is clicked', () => {
        test('should send the correct UA analytics event', async ({
          smartSnippet,
        }) => {});
      });
      test.describe('when an inline link within the smart snippet answer is clicked', () => {
        test('should send the correct UA analytics event', async ({
          smartSnippet,
        }) => {});
      });
    });

    test.describe('when the smart snippet is collapsed', () => {
      test.describe('when expanding the smart snippet answer', () => {
        test('should send the correct UA analytics event', async ({smartSnippet}) => {});
      });

      test.describe('when collapsing the smart snippet answer', () => {
        test('should send the correct UA analytics event', async ({
          smartSnippet,
        }) => {});
      });
    });

    test.describe('when clicking on the feedback like button', () => {
      test('should send the correct UA analytics event', async ({smartSnippet}) => {});
    });

    test.describe('when clicking on the feedback dislike button', () => {
      test('should send the correct UA analytics event', async ({
        smartSnippet,
      }) => {});

      test.describe('when providing feedback', () => {
        test('should send the correct open feedback modal UA analytics event', async ({
          smartSnippet,
        }) => {});

        test.describe('when selecting and submitting a feedback option', () => {
          test('should send the following analytics events: logOpenSmartSnippetFeedbackModal, logSendSmartSnippetReason, logCloseSmartSnippetFeedbackModal', async () => {});
        });

        test.describe('when trying to open the feedback modal after executing the same query', () => {
          test('should not open the feedback modal', async () => {});
        });

        test.describe('when trying to open the feedback modal after executing a query that gave a new answer', () => {
          test('should open the feedback modal', async () => {});
        });
      });
    });
  });
});
