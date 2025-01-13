import {testSearch, testInsight} from './fixture';
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
          const smartSnippetTitleClickPromise =
            smartSnippet.waitForSmartSnippetSourceClickUaAnalytics();
          await smartSnippet.clickOnSourceTitle();
          await smartSnippetTitleClickPromise;
        });
      });

      test.describe('when the source uri is clicked', () => {
        test('should send the correct UA analytics event', async ({
          smartSnippet,
        }) => {
          const smartSnippetUriClickPromise =
            smartSnippet.waitForSmartSnippetSourceClickUaAnalytics();
          await smartSnippet.clickOnSourceUri();
          await smartSnippetUriClickPromise;
        });
      });

      test.describe('when an inline link within the smart snippet answer is clicked', () => {
        test('should send the correct UA analytics event', async ({
          smartSnippet,
        }) => {
          const smartSnippetUriClickPromise =
            smartSnippet.waitForSmartSnippetInlineLinkClickUaAnalytics();
          await smartSnippet.clickOnFirstInlineLink();
          await smartSnippetUriClickPromise;
        });
      });
    });

    test.describe('when expanding and collapsing the smart snippet', () => {
      test('should send the correct UA analytics events', async ({
        smartSnippet,
      }) => {
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
      test('should send the correct UA analytics event', async ({
        smartSnippet,
      }) => {
        const likeAnalyticsPromise =
          smartSnippet.waitForLikeSmartSnippetUaAnalytics();
        await smartSnippet.clickLikeButton();
        await likeAnalyticsPromise;
      });
    });

    test.describe('when clicking on the feedback dislike button', () => {
      test('should send the correct UA analytics event', async ({
        smartSnippet,
      }) => {
        const dislikeAnalyticsPromise =
          smartSnippet.waitForDislikeSmartSnippetUaAnalytics();
        await smartSnippet.clickDislikeButton();
        await dislikeAnalyticsPromise;
      });

      test.describe('when opening the feedback modal and providing feedback', () => {
        test('should send the correct UA analytics events', async ({
          smartSnippet,
        }) => {
          const expectedReason = 'does_not_answer';

          const openFeedbackModalAnalyticsPromise =
            smartSnippet.waitForOpenFeedbackModalUaAnalytics();
          await smartSnippet.clickDislikeButton();
          await smartSnippet.clickExplainWhyButton();
          await openFeedbackModalAnalyticsPromise;

          const submitFeedbackAnalyticsPromise =
            smartSnippet.waitForFeedbackSubmitUaAnalytics(expectedReason);

          await smartSnippet.selectFirstFeedbackOptionLabel();
          await smartSnippet.clickFeedbackSubmitButton();
          await submitFeedbackAnalyticsPromise;
        });
      });

      test.describe('when closing the feedback modal', () => {
        test('should send the correct close feedback modal UA analytics event', async ({
          smartSnippet,
        }) => {
          await smartSnippet.clickDislikeButton();
          await smartSnippet.clickExplainWhyButton();
          const closeFeedbackModalAnalyticsPromise =
            smartSnippet.waitForCloseFeedbackModalUaAnalytics();
          await smartSnippet.clickFeedbackModalCancelButton();
          await closeFeedbackModalAnalyticsPromise;
        });
      });
    });
  });
});
