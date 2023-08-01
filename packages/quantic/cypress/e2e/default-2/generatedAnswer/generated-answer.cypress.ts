import {configure} from '../../../page-objects/configurator';
import {
  interceptSearch,
  mockSearchWithGeneratedAnswer,
  mockSearchWithoutGeneratedAnswer,
  mockStreamResponse,
} from '../../../page-objects/search';
import {scope} from '../../../reporters/detailed-collector';
import {GeneratedAnswerActions as Actions} from './generated-answer-actions';
import {GeneratedAnswerExpectations as Expect} from './generated-answer-expectations';

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

      it('should display the correct message', () => {
        Expect.displayGeneratedAnswerCard(true);
        Expect.generatedAnswerContains(testText);
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

        scope('when liking the generated answer', () => {
          Actions.dislikeGeneratedAnswer();
          Expect.logDislikeGeneratedAnswer(streamId);
          Expect.likeButtonIsChecked(false);
          Expect.dislikeButtonIsChecked(true);
        });
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
        mockSearchWithGeneratedAnswer;
        mockStreamResponse(streamId, testErrorPayload);
        visitGeneratedAnswer();
      });

      it('should not display the component', () => {
        Expect.displayGeneratedAnswerCard(false);
      });
    });
  });
});
