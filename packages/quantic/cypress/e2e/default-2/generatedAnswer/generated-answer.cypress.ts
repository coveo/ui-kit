import {configure} from '../../../page-objects/configurator';
import {
  interceptSearch,
  mockSearchWithGeneratedAnswer,
  mockSearchWithoutGeneratedAnswer,
  mockStreamResponse,
  mockStreamError,
  InterceptAliases,
  getStreamInterceptAlias,
} from '../../../page-objects/search';
import {scope} from '../../../reporters/detailed-collector';
import {GeneratedAnswerActions as Actions} from './generated-answer-actions';
import {GeneratedAnswerExpectations as Expect} from './generated-answer-expectations';

const GENERATED_ANSWER_VISIBILITY_KEY = 'generatedAnswerIsVisible';

describe('quantic-generated-answer', () => {
  const pageUrl = 's/quantic-generated-answer';

  function visitGeneratedAnswer() {
    interceptSearch();
    cy.visit(pageUrl);
    configure();
  }

  describe('when no stream ID is returned', () => {
    beforeEach(() => {
      mockSearchWithoutGeneratedAnswer;
      visitGeneratedAnswer();
    });

    it('should not display the component', () => {
      Expect.displayGeneratedAnswerCard(false);
    });
  });

  describe('when a stream ID is returned', () => {
    describe('when a message event is received', () => {
      const streamId = crypto.randomUUID();

      const testText = 'Some text';
      const testMessagePayload = {
        payloadType: 'genqa.messageType',
        payload: JSON.stringify({
          textDelta: testText,
        }),
        finishReason: 'COMPLETED',
      };

      beforeEach(() => {
        mockSearchWithGeneratedAnswer(streamId);
        mockStreamResponse(streamId, testMessagePayload);
        visitGeneratedAnswer();
      });

      it('should log the stream ID in the search event custom data', () => {
        Expect.logStreamIdInAnalytics(streamId);
      });

      it('should display the generated answer content', () => {
        Expect.displayGeneratedAnswerContent(true);
        Expect.sessionStorageExists(GENERATED_ANSWER_VISIBILITY_KEY, false);
      });

      it('should display the correct message', () => {
        Expect.displayGeneratedAnswerCard(true);
        Expect.generatedAnswerContains(testText);
        Expect.generatedAnswerIsStreaming(false);
      });

      it('should display feedback buttons', () => {
        Expect.displayLikeButton(true);
        Expect.displayDislikeButton(true);
        Expect.likeButtonIsChecked(false);
        Expect.dislikeButtonIsChecked(false);

        scope('when liking the generated answer', () => {
          Actions.likeGeneratedAnswer();
          Expect.logLikeGeneratedAnswer(streamId);
          Expect.likeButtonIsChecked(true);
          Expect.dislikeButtonIsChecked(false);
        });

        scope('when disliking the generated answer', () => {
          Actions.dislikeGeneratedAnswer();
          Expect.logDislikeGeneratedAnswer(streamId);
          Expect.likeButtonIsChecked(false);
          Expect.dislikeButtonIsChecked(true);
        });
      });

      it('should display the toggle generated answer button', () => {
        Expect.displayToggleGeneratedAnswerButton(true);
        Expect.toggleGeneratedAnswerButtonIsChecked(true);

        scope('when toggeling off the generated answer', () => {
          Actions.clickToggleGeneratedAnswerButton();
          Expect.toggleGeneratedAnswerButtonIsChecked(false);
          Expect.displayGeneratedAnswerContent(false);
          Expect.displayLikeButton(false);
          Expect.displayDislikeButton(false);
          Expect.logHideGeneratedAnswer(streamId);
          Expect.sessionStorageExists(GENERATED_ANSWER_VISIBILITY_KEY, true);
          Expect.sessionStorageContains(
            GENERATED_ANSWER_VISIBILITY_KEY,
            'false'
          );
        });

        scope('when toggeling on the generated answer', () => {
          Actions.clickToggleGeneratedAnswerButton();
          Expect.toggleGeneratedAnswerButtonIsChecked(true);
          Expect.displayGeneratedAnswerContent(true);
          Expect.displayLikeButton(true);
          Expect.displayDislikeButton(true);
          Expect.logShowGeneratedAnswer(streamId);
          Expect.sessionStorageExists(GENERATED_ANSWER_VISIBILITY_KEY, true);
          Expect.sessionStorageContains(
            GENERATED_ANSWER_VISIBILITY_KEY,
            'true'
          );
        });
      });
    });

    describe('when the generated answer is still streaming', () => {
      const streamId = crypto.randomUUID();

      const testText = 'Some text';
      const testMessagePayload = {
        payloadType: 'genqa.messageType',
        payload: JSON.stringify({
          textDelta: testText,
        }),
      };

      beforeEach(() => {
        mockSearchWithGeneratedAnswer(streamId);
        mockStreamResponse(streamId, testMessagePayload);
        visitGeneratedAnswer();
      });

      it('should display the correct message and the streaming cursor', () => {
        Expect.displayGeneratedAnswerCard(true);
        Expect.generatedAnswerContains(testText);
        Expect.generatedAnswerIsStreaming(true);
        Expect.displayLikeButton(false);
        Expect.displayDislikeButton(false);
        Expect.displayToggleGeneratedAnswerButton(true);
        Expect.toggleGeneratedAnswerButtonIsChecked(true);
      });
    });

    describe('when a citation event is received', () => {
      const inactiveLink = 'javascript:void(0);';
      const streamId = crypto.randomUUID();
      const firstTestCitation = {
        id: 'some-id-1',
        title: 'Some Title 1',
        uri: 'https://www.coveo.com',
        permanentid: 'some-permanent-id-1',
        clickUri: inactiveLink,
      };
      const secondTestCitation = {
        id: 'some-id-2',
        title: 'Some Title 2',
        uri: 'https://www.coveo.com',
        permanentid: 'some-permanent-id-2',
        clickUri: inactiveLink,
      };
      const testCitations = [firstTestCitation, secondTestCitation];
      const testMessagePayload = {
        payloadType: 'genqa.citationsType',
        payload: JSON.stringify({
          citations: testCitations,
        }),
        finishReason: 'COMPLETED',
      };

      beforeEach(() => {
        mockSearchWithGeneratedAnswer(streamId);
        mockStreamResponse(streamId, testMessagePayload);
        visitGeneratedAnswer();
      });

      it('should properly display the source citations', () => {
        Expect.displayCitations(true);
        testCitations.forEach((citation, index) => {
          Expect.citationTitleContains(index, citation.title);
          Expect.citationNumberContains(index, `${index + 1}`);
          Expect.citationLinkContains(index, citation.clickUri);
        });
      });

      it('should log the correct analytics event when a citation is clicked', () => {
        Actions.clickCitation(0);
        Expect.logOpenGeneratedAnswerSource(streamId, testCitations[0]);
      });
    });

    describe('when an end of stream event is received', () => {
      const streamId = crypto.randomUUID();

      const testText = 'Some text';
      const testMessagePayload = {
        payloadType: 'genqa.endOfStreamType',
        payload: JSON.stringify({
          textDelta: testText,
        }),
        finishReason: 'COMPLETED',
      };

      beforeEach(() => {
        mockSearchWithGeneratedAnswer(streamId);
        mockStreamResponse(streamId, testMessagePayload);
        visitGeneratedAnswer();
      });

      it('should log the generated answer stream end event', () => {
        Expect.logGeneratedAnswerStreamEnd(streamId);
      });
    });

    describe('when an error event is received', () => {
      const streamId = crypto.randomUUID();

      const testErrorPayload = {
        finishReason: 'ERROR',
        errorMessage: 'An error message',
        errorCode: 500,
      };

      beforeEach(() => {
        mockSearchWithGeneratedAnswer(streamId);
        mockStreamResponse(streamId, testErrorPayload);
        visitGeneratedAnswer();
      });

      it('should not display the component', () => {
        Expect.displayGeneratedAnswerCard(false);
      });
    });

    describe('when the stream connection fails', () => {
      const streamId = crypto.randomUUID();

      describe('Non-retryable error (4XX)', () => {
        beforeEach(() => {
          mockSearchWithGeneratedAnswer(streamId);
          mockStreamError(streamId, 406);
          visitGeneratedAnswer();
          cy.wait(getStreamInterceptAlias(streamId));
        });

        it('should not show the component', () => {
          Expect.displayGeneratedAnswerCard(false);
        });
      });

      describe('Retryable error', () => {
        [500, 429].forEach((errorCode) => {
          describe(`${errorCode} error`, () => {
            beforeEach(() => {
              mockSearchWithGeneratedAnswer(streamId);
              mockStreamError(streamId, errorCode);
              visitGeneratedAnswer();
            });

            it('should retry the stream 3 times then offer a retry button', () => {
              for (let times = 0; times < 3; times++) {
                Expect.displayGeneratedAnswerCard(false);
                cy.wait(getStreamInterceptAlias(streamId));
              }
              Expect.displayGeneratedAnswerCard(true);

              Actions.clickRetry();
              cy.wait(InterceptAliases.Search);
              Expect.logRetryGeneratedAnswer(streamId);
            });
          });
        });
      });
    });
  });
});
