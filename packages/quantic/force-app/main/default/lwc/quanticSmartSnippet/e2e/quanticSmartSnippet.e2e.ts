import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';
import smartSnippetData from './data';

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
      test('should send the source title analytics event when the title is clicked', async ({
        smartSnippet,
      }) => {
        const smartSnippetTitleClickPromise =
          smartSnippet.waitForSmartSnippetSourceClickUaAnalytics();
        await smartSnippet.clickOnSourceTitle();
        await smartSnippetTitleClickPromise;
      });

      test('should send the source uri analytics event when the source uri is clicked', async ({
        smartSnippet,
      }) => {
        const smartSnippetUriClickPromise =
          smartSnippet.waitForSmartSnippetSourceClickUaAnalytics();
        await smartSnippet.clickOnSourceUri();
        await smartSnippetUriClickPromise;
      });

      test('should send the inline link analytics event when the inline link is clicked', async ({
        smartSnippet,
      }) => {
        const smartSnippetUriClickPromise =
          smartSnippet.waitForSmartSnippetInlineLinkClickUaAnalytics();
        await smartSnippet.clickOnFirstInlineLink();
        await smartSnippetUriClickPromise;
      });

      test('should send the expand and collapse analytics events', async ({
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

    test.describe('feedback modal interactions', () => {
      test.describe('when clicking on the feedback like button', () => {
        test('should send the like analytics event', async ({smartSnippet}) => {
          const likeAnalyticsPromise =
            smartSnippet.waitForLikeSmartSnippetUaAnalytics();
          await smartSnippet.clickLikeButton();
          await likeAnalyticsPromise;
        });
      });

      test.describe('when clicking on the feedback dislike button', () => {
        test('should send the dislike analytics event', async ({
          smartSnippet,
        }) => {
          const dislikeAnalyticsPromise =
            smartSnippet.waitForDislikeSmartSnippetUaAnalytics();
          await smartSnippet.clickDislikeButton();
          await dislikeAnalyticsPromise;
        });

        test.describe('when opening the feedback modal and providing feedback', () => {
          test('should send the smart snippet reason analytics events', async ({
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
          test('should send the correct close feedback modal analytics event', async ({
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

      test.describe('when trying to open the feedback modal after executing the same query', () => {
        test('should not allow to open the feedback modal', async ({
          smartSnippet,
          search,
        }) => {
          await smartSnippet.clickDislikeButton();
          await smartSnippet.clickExplainWhyButton();
          await smartSnippet.selectFirstFeedbackOptionLabel();
          await smartSnippet.clickFeedbackSubmitButton();

          await smartSnippet.clickFeedbackModalDoneButton();

          const searchResponsePromise = search.waitForSearchResponse();
          await search.performSearch();
          await searchResponsePromise;

          expect(smartSnippet.dislikeButton).not.toBeNull();
          await smartSnippet.clickDislikeButton();
          await expect(smartSnippet.explainWhyButton).not.toBeVisible();
        });
      });

      test.describe('when trying to open the feedback modal after executing a query that gave a new answer', () => {
        test('should allow to open the feedback modal', async ({
          smartSnippet,
          search,
        }) => {
          await smartSnippet.clickDislikeButton();
          await smartSnippet.clickExplainWhyButton();
          await smartSnippet.selectFirstFeedbackOptionLabel();
          await smartSnippet.clickFeedbackSubmitButton();

          await smartSnippet.clickFeedbackModalDoneButton();

          await search.mockSearchWithSmartSnippetResponse({
            ...smartSnippetData,
            question: 'new question',
            answerSnippet: 'new answer',
          });
          const searchResponsePromise = search.waitForSearchResponse();
          await search.performSearch();
          await searchResponsePromise;

          expect(smartSnippet.dislikeButton).not.toBeNull();
          await smartSnippet.clickDislikeButton();
          await expect(smartSnippet.explainWhyButton).toBeVisible();
        });
      });
    });
  });
});
