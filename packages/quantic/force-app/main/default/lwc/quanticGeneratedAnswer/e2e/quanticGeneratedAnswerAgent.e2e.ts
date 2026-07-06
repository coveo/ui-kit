import {testAgent, expect} from './fixture-agent';
import agentData from './agentData';
import {analyticsModeTest} from '../../../../../../playwright/utils/analyticsMode';

const exampleAgentId = '5fd0b5ea-d368-488e-bdeb-f6221ec0fb98';

analyticsModeTest.forEach((analytics) => {
  testAgent.describe(`quantic generated answer - agent - ${analytics.label}`, () => {
    testAgent.use({
      analyticsMode: analytics.mode,
      options: {agentId: exampleAgentId},
    });

    testAgent.describe('when the answer has been generated', () => {
      testAgent(
        'should send a stream end analytics event',
        async ({generatedAnswer}) => {
          await generatedAnswer.streamEndAnalyticRequestPromise;
        }
      );
    });

    testAgent.describe('when providing feedback', () => {
      testAgent(
        'should send like analytics event',
        async ({generatedAnswer}) => {
          await generatedAnswer.streamEndAnalyticRequestPromise;
          const likeAnalyticRequestPromise =
            generatedAnswer.waitForLikeGeneratedAnswerAnalytics();
          await generatedAnswer.clickLikeButton();
          await likeAnalyticRequestPromise;
        }
      );

      testAgent(
        'should send dislike analytics event',
        async ({generatedAnswer}) => {
          await generatedAnswer.streamEndAnalyticRequestPromise;
          const dislikeAnalyticRequestPromise =
            generatedAnswer.waitForDislikeGeneratedAnswerAnalytics();
          await generatedAnswer.clickDislikeButton();
          await dislikeAnalyticRequestPromise;
        }
      );
    });

    testAgent.describe('when copying the generated answer to clipboard', () => {
      testAgent(
        'should send a copy to clipboard analytics event',
        async ({generatedAnswer}) => {
          await generatedAnswer.streamEndAnalyticRequestPromise;
          const analyticRequestPromise =
            generatedAnswer.waitForCopyToClipboardAnalytics();
          await generatedAnswer.clickCopyToClipboardButton();
          await analyticRequestPromise;
        }
      );
    });

    testAgent.describe('when the property withToggle is set to true', () => {
      testAgent.use({
        options: {agentId: exampleAgentId, withToggle: true},
      });

      testAgent(
        'should allow toggling the generated answer OFF and ON and log analytics',
        async ({generatedAnswer}) => {
          await generatedAnswer.streamEndAnalyticRequestPromise;
          const hideAnswerAnalyticRequestPromise =
            generatedAnswer.waitForHideAnswersAnalytics();
          await generatedAnswer.clickToggleButton();
          await hideAnswerAnalyticRequestPromise;

          const showAnswerAnalyticRequestPromise =
            generatedAnswer.waitForShowAnswersAnalytics();
          await generatedAnswer.clickToggleButton();
          await showAnswerAnalyticRequestPromise;
        }
      );
    });

    testAgent.describe('when interacting with citations', () => {
      testAgent.describe('when hovering over a citation', () => {
        testAgent(
          'should log citation hover analytics',
          async ({generatedAnswer}) => {
            await generatedAnswer.streamEndAnalyticRequestPromise;
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
      });

      testAgent.describe('when clicking on a citation', () => {
        testAgent(
          'should log citation click analytics',
          async ({generatedAnswer}) => {
            await generatedAnswer.streamEndAnalyticRequestPromise;
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
      });
    });

    testAgent.describe('when sending a follow-up question', () => {
      testAgent(
        'should send the follow-up request with the correct conversationId and conversationToken',
        async ({generatedAnswer}) => {
          await generatedAnswer.streamEndAnalyticRequestPromise;

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

      testAgent(
        'should send stream end analytics with the same conversationId but a different answerId for the follow-up',
        async ({generatedAnswer}) => {
          await generatedAnswer.streamEndAnalyticRequestPromise;

          const followUpStreamEndPromise =
            generatedAnswer.waitForFollowUpStreamEndAnalytics(
              agentData.answerId2
            );

          await generatedAnswer.typeFollowUpQuestion('follow-up question');
          await generatedAnswer.submitFollowUp();

          await followUpStreamEndPromise;
        }
      );
    });
  });
});
