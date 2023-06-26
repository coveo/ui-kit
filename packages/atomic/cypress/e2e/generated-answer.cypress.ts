import {TestFixture} from '../fixtures/test-fixture';
import {
  addGeneratedAnswer,
  getStreamInterceptAlias,
  interceptStreamResponse,
} from './generated-answer-actions';
import {GeneratedAnswerSelectors} from './generated-answer-selectors';

describe('Generated Answer Test Suites', () => {
  describe('Generated Answer', () => {
    function setupGeneratedAnswer(streamId?: string) {
      new TestFixture().with(addGeneratedAnswer(streamId)).init();
    }

    describe('when no stream ID is returned', () => {
      beforeEach(() => {
        setupGeneratedAnswer();
      });

      it('should not display the component', () => {
        GeneratedAnswerSelectors.container().should('not.exist');
      });
    });

    describe('when a stream ID is returned', () => {
      describe('when a message event is received', () => {
        const streamId = crypto.randomUUID();

        const testTextDelta = 'Some text';
        const testMessagePayload = {
          payloadType: 'genqa.messageType',
          payload: JSON.stringify({
            textDelta: testTextDelta,
          }),
          finishReason: 'COMPLETED',
        };

        beforeEach(() => {
          interceptStreamResponse(streamId, testMessagePayload);
          setupGeneratedAnswer(streamId);
        });

        it('should display the message', () => {
          cy.wait(getStreamInterceptAlias(streamId));

          GeneratedAnswerSelectors.answer().should('have.text', testTextDelta);
        });
      });
    });
  });
});
