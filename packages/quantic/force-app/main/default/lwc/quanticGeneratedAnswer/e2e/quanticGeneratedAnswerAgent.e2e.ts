import {testAgent, expect} from './fixture-agent';
import agentData from './agentData';
import {
  analyticsModeTest,
  AnalyticsModeEnum,
} from '../../../../../../playwright/utils/analyticsMode';

const exampleAgentId = '5fd0b5ea-d368-488e-bdeb-f6221ec0fb98';

analyticsModeTest.forEach((analytics) => {
  testAgent.describe(`quantic generated answer - agent - ${analytics.label}`, () => {
    testAgent.use({
      analyticsMode: analytics.mode,
      options: {agentId: exampleAgentId},
      permissions: ['clipboard-read', 'clipboard-write'],
    });

    if (analytics.mode !== AnalyticsModeEnum.legacy) {
      testAgent.fixme(true, 'Agent next analytics mode not yet implemented');
      return;
    }

    testAgent(
      'should handle multiple answer generation, feedback, clipboard, citation, and follow-up interactions',
      async ({generatedAnswer, page}) => {
        await testAgent.step(
          'should send a stream end analytics event when the first answer is generated',
          async () => {
            await generatedAnswer.streamEndAnalyticRequestPromise;
          }
        );

        await testAgent.step(
          'should send like analytics event when liking the first answer',
          async () => {
            const likeAnalyticRequestPromise =
              generatedAnswer.waitForLikeGeneratedAnswerAnalytics();
            await generatedAnswer.clickLikeButton();
            await likeAnalyticRequestPromise;
          }
        );

        await testAgent.step(
          'should send dislike analytics event when disliking the first answer',
          async () => {
            const dislikeAnalyticRequestPromise =
              generatedAnswer.waitForDislikeGeneratedAnswerAnalytics();
            await generatedAnswer.clickDislikeButton();
            await dislikeAnalyticRequestPromise;
          }
        );

        await testAgent.step(
          'should send a copy to clipboard analytics event and update the clipboard with the first answer content',
          async () => {
            const analyticRequestPromise =
              generatedAnswer.waitForCopyToClipboardAnalytics();
            await generatedAnswer.clickCopyToClipboardButton();
            await analyticRequestPromise;
            
            const clipboardContent = await page.evaluate(() =>
              navigator.clipboard.readText()
            );
            expect(clipboardContent).toContain('Testing in Coveo');
          }
        );

        await testAgent.step(
          'should log citation hover analytics when hovering over a citation from the first answer',
          async () => {
            const citationIndex = 0;
            const {id, permanentid} = agentData.citations[citationIndex];
            const citationHoverAnalyticRequestPromise =
              generatedAnswer.waitForSourceHoverAnalytics({
                citationId: id,
                permanentId: permanentid,
              });

            await generatedAnswer.hoverOverCitation(citationIndex);
            await citationHoverAnalyticRequestPromise;
          }
        );

        await testAgent.step(
          'should log citation click analytics when clicking on a citation from the first answer',
          async () => {
            const citationIndex = 0;
            const {id, title, source, uri, clickUri, permanentid} =
              agentData.citations[citationIndex];
            const citationClickAnalyticRequestPromise =
              generatedAnswer.waitForCitationClickAnalytics({
                documentTitle: title,
                sourceName: source,
                documentPosition: citationIndex + 1,
                documentUri: uri,
                documentUrl: clickUri,
                citationId: id,
                contentIDKey: 'permanentid',
                contentIDValue: permanentid,
              });
            await generatedAnswer.clickOnCitation(citationIndex);
            await citationClickAnalyticRequestPromise;
          }
        );

        await testAgent.step(
          'FIRST FOLLOW-UP: should send the follow-up request with the correct conversationId and conversationToken',
          async () => {
            const followUpRequestPromise =
              generatedAnswer.waitForAgentFollowUpRequest();

            await generatedAnswer.typeFollowUpQuestion('follow-up question');
            await generatedAnswer.submitFollowUp();

            const followUpRequest = await followUpRequestPromise;
            const followUpRequestBody = followUpRequest.postDataJSON();
            expect(followUpRequestBody.conversationId).toBe(
              agentData.conversationId
            );
            expect(followUpRequestBody.conversationToken).toBe(
              agentData.conversationToken
            );
          }
        );

        await testAgent.step(
          'should send stream end analytics with the right answerId for the follow-up',
          async () => {
            const followUpStreamEndPromise =
              generatedAnswer.waitForFollowUpStreamEndAnalytics(
                agentData.answerId2
              );
            await followUpStreamEndPromise;
          }
        );

        await testAgent.step(
          'should send like analytics with the follow-up answerId when liking the first follow-up answer',
          async () => {
            const likeAnalyticRequestPromise =
              generatedAnswer.waitForLikeGeneratedAnswerAnalyticsForId(
                agentData.answerId2
              );
            // Should be the first like button, since the previous answers are collapsed and the follow-up answer is the only one visible.
            await generatedAnswer.clickNthLikeButton(0);
            await likeAnalyticRequestPromise;
          }
        );

        await testAgent.step(
          'SECOND FOLLOW-UP: should send the second follow-up request with the correct conversationId and conversationToken',
          async () => {
            const followUpRequestPromise =
              generatedAnswer.waitForAgentFollowUpRequest();

            await generatedAnswer.typeFollowUpQuestion(
              'second follow-up question'
            );
            await generatedAnswer.submitFollowUp();

            const followUpRequest = await followUpRequestPromise;
            const followUpRequestBody = followUpRequest.postDataJSON();
            expect(followUpRequestBody.conversationId).toBe(
              agentData.conversationId
            );
            expect(followUpRequestBody.conversationToken).toBe(
              agentData.conversationToken
            );
          }
        );

        await testAgent.step(
          'should send stream end analytics with the right answerId for the second follow-up',
          async () => {
            const followUpStreamEndPromise =
              generatedAnswer.waitForFollowUpStreamEndAnalytics(
                agentData.answerId3
              );
            await followUpStreamEndPromise;
          }
        );

        await testAgent.step(
          'should send dislike analytics with the right answerId for the second follow-up when disliking the second follow-up answer',
          async () => {
            const dislikeAnalyticRequestPromise =
              generatedAnswer.waitForDislikeGeneratedAnswerAnalyticsForId(
                agentData.answerId3
              );
            // Should be the first dislike button, since the previous answers are collapsed and the second follow-up answer is the only one visible.
            await generatedAnswer.clickNthDislikeButton(0);
            await dislikeAnalyticRequestPromise;
          }
        );

        await testAgent.step(
          'should expand previous answers when clicking on the "Show previous answers" button',
          async () => {
            await generatedAnswer.clickShowPreviousAnswersButton();
            await expect(generatedAnswer.threadItems).toHaveCount(3);
          }
        );

        await testAgent.step(
          'should expand the first answer when clicking on the toggle button of the first answer',
          async () => {
            await generatedAnswer.clickNthThreadItem(0);
            await expect(generatedAnswer.generatedAnswerBody.nth(0)).toBeVisible();
            await expect(generatedAnswer.generatedAnswerBody.nth(1)).not.toBeVisible();
            await expect(generatedAnswer.generatedAnswerBody.nth(2)).toBeVisible();
          }
        );

        await testAgent.step(
          'should allow to like the first answer, sending the correct analytics and not affecting the other answers',
          async () => {
            const likeAnalyticRequestPromise =
              generatedAnswer.waitForLikeGeneratedAnswerAnalyticsForId(
                agentData.answerId1
              );
            await generatedAnswer.clickNthLikeButton(0);
            await likeAnalyticRequestPromise;
            await expect(generatedAnswer.likeButton.nth(0)).toHaveAttribute('aria-pressed', 'true');
            await expect(generatedAnswer.dislikeButton.nth(0)).toHaveAttribute('aria-pressed', 'false');
            // Only two answers are visible, so only 2 like/dislike buttons visible.
            await expect(generatedAnswer.dislikeButton.nth(1)).toHaveAttribute('aria-pressed', 'true');
            await expect(generatedAnswer.likeButton.nth(1)).toHaveAttribute('aria-pressed', 'false');
          }
        );
      }
    );
  });
});
