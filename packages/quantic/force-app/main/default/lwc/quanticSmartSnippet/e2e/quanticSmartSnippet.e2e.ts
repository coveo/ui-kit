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
          await smartSnippet.smartSnippetToggleButton.click();
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

    test.describe('when expanding and collapsing the smart snippet', () => {
      test('should send the correct UA analytics events', async ({smartSnippet}) => {
        const expandSmartSnippetAnalyticsPromise =
          smartSnippet.waitForExpandSmartSnippetUaAnalytics();
        await smartSnippet.clickToggleButton();
        await expandSmartSnippetAnalyticsPromise;

        const collapseSmartSnippetAnalyticsPromise =
          smartSnippet.waitForCollapseSmartSnippetUaAnalytics();
        await smartSnippet.clickToggleButton();
        await collapseSmartSnippetAnalyticsPromise;
      });
    });

    test.describe('when clicking on the feedback like button', () => {
      test('should send the correct UA analytics event', async ({smartSnippet}) => {
        const likeAnalyticsPromise = smartSnippet.waitForLikeSmartSnippetUaAnalytics();
        await smartSnippet.clickLikeButton();
        await likeAnalyticsPromise;
      });
    });

    test.describe('when clicking on the feedback dislike button', () => {
      test('should send the correct UA analytics event', async ({
        smartSnippet,
      }) => {
        const dislikeAnalyticsPromise = smartSnippet.waitForDislikeSmartSnippetUaAnalytics();
        await smartSnippet.clickDislikeButton();
        await dislikeAnalyticsPromise;
      });

      test.describe('when opening the feedback modal and providing feedback', () => {
        test('should send the correct open feedback modal UA analytics event', async ({
          smartSnippet,
        }) => {
          const openFeedbackModalAnalyticsPromise = smartSnippet.waitForOpenFeedbackModalUaAnalytics();
          await smartSnippet.clickDislikeButton();
          await smartSnippet.clickExplainWhyButton();
          await openFeedbackModalAnalyticsPromise;
        });

        test.describe('when selecting and submitting a feedback option', () => {
          test('should send the correct UA analytics event', async ({
            smartSnippet,
          }) => {
            await smartSnippet.clickDislikeButton();
            await smartSnippet.clickExplainWhyButton();

            const submitFeedbackAnalyticsPromise = smartSnippet.waitForFeedbackSubmitUaAnalytics();
            await smartSnippet.selectFirstFeedbackOption();
            await smartSnippet.clickFeedbackSubmitButton();
            await submitFeedbackAnalyticsPromise;
          });
        });

        test.describe('when trying to open the feedback modal after executing the same query', () => {
          test('should not open the feedback modal', async () => {
            
          });
        });

        test.describe('when trying to open the feedback modal after executing a query that gave a new answer', () => {
          test('should open the feedback modal', async () => {});
        });
      });

      test.describe('when closing the feedback modal', () => {
        test('should send the correct close feedback modal UA analytics event', async ({smartSnippet}) => {
          const closeFeedbackModalAnalyticsPromise = smartSnippet.waitForCloseFeedbackModalUaAnalytics();
          await smartSnippet.clickDislikeButton();
          await smartSnippet.clickExplainWhyButton();
          await smartSnippet.clickFeedbackModalCancelButton();
          await closeFeedbackModalAnalyticsPromise;
        });
      });
    });
  });
});
