import {TestFixture} from '../fixtures/test-fixture';
import {AnalyticsTracker} from '../utils/analyticsUtils';
import {
  addGeneratedAnswer,
  getStreamInterceptAlias,
  mockStreamError,
  mockStreamResponse,
} from './generated-answer-actions';
import {GeneratedAnswerSelectors} from './generated-answer-selectors';
import * as GeneratedAnswerAssertions from './generated-answer-assertions';

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
      describe('when component is deactivated', () => {
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
          mockStreamResponse(streamId, testMessagePayload);
          setupGeneratedAnswer(streamId);
          cy.wait(getStreamInterceptAlias(streamId));

          GeneratedAnswerSelectors.toggle().click();
        });

        GeneratedAnswerAssertions.assertAnswerVisibility(false);
        GeneratedAnswerAssertions.assertFeedbackButtonsVisibility(false);
        GeneratedAnswerAssertions.assertToggleValue(false);
        GeneratedAnswerAssertions.assertLocalStorageData({isVisible: false});

        describe('when component is re-activated', () => {
          beforeEach(() => {
            GeneratedAnswerSelectors.toggle().click();
          });

          GeneratedAnswerAssertions.assertAnswerVisibility(true);
          GeneratedAnswerAssertions.assertFeedbackButtonsVisibility(true);
          GeneratedAnswerAssertions.assertToggleValue(true);
          GeneratedAnswerAssertions.assertLocalStorageData({isVisible: true});
        });
      });

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
          mockStreamResponse(streamId, testMessagePayload);
          setupGeneratedAnswer(streamId);
          cy.wait(getStreamInterceptAlias(streamId));
        });

        it('should log the stream ID in the search event custom data', () => {
          TestFixture.getUACustomData().then((customData) => {
            expect(customData).to.have.property(
              'generativeQuestionAnsweringId',
              streamId
            );
          });
        });

        it('should display the message', () => {
          GeneratedAnswerSelectors.answer().should('have.text', testTextDelta);
        });

        it('should display feedback buttons', () => {
          GeneratedAnswerSelectors.likeButton().should('exist');
          GeneratedAnswerSelectors.dislikeButton().should('exist');
        });
      });

      describe('when a citation event is received', () => {
        const streamId = crypto.randomUUID();

        const testCitation = {
          id: 'some-id-123',
          title: 'Some Title',
          uri: 'https://www.coveo.com',
          permanentid: 'some-permanent-id-123',
          clickUri: 'https://www.coveo.com/en',
        };
        const testMessagePayload = {
          payloadType: 'genqa.citationsType',
          payload: JSON.stringify({
            citations: [testCitation],
          }),
          finishReason: 'COMPLETED',
        };

        beforeEach(() => {
          mockStreamResponse(streamId, testMessagePayload);
          setupGeneratedAnswer(streamId);
          cy.wait(getStreamInterceptAlias(streamId));
        });

        it('should display the citation link', () => {
          GeneratedAnswerSelectors.citationsLabel().should(
            'have.text',
            'Learn more'
          );
          GeneratedAnswerSelectors.citationTitle().should(
            'have.text',
            testCitation.title
          );
          GeneratedAnswerSelectors.citationIndex().should('have.text', '1');
          GeneratedAnswerSelectors.citation().should(
            'have.attr',
            'href',
            testCitation.clickUri
          );
        });

        describe('when a citation is clicked', () => {
          beforeEach(() => {
            AnalyticsTracker.reset();
            GeneratedAnswerSelectors.citation()
              .invoke('removeAttr', 'target') // Otherwise opens a new tab that messes with the tests
              .click();
          });

          GeneratedAnswerAssertions.assertLogOpenGeneratedAnswerSource(true);
        });

        describe('when a citation is right-clicked', () => {
          beforeEach(() => {
            AnalyticsTracker.reset();
            GeneratedAnswerSelectors.citation().rightclick();
          });

          GeneratedAnswerAssertions.assertLogOpenGeneratedAnswerSource(true);
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
          mockStreamResponse(streamId, testErrorPayload);
          setupGeneratedAnswer(streamId);
          cy.wait(getStreamInterceptAlias(streamId));
        });

        it('should not display the component', () => {
          GeneratedAnswerSelectors.container().should('not.exist');
        });
      });

      describe('when the stream connection fails', () => {
        const streamId = crypto.randomUUID();

        describe('Non-retryable error (4XX)', () => {
          beforeEach(() => {
            mockStreamError(streamId, 406);
            setupGeneratedAnswer(streamId);
            cy.wait(getStreamInterceptAlias(streamId));
          });

          it('should not show the component', () => {
            GeneratedAnswerSelectors.container().should('not.exist');
          });
        });

        describe('Retryable error', () => {
          [500, 429].forEach((errorCode) => {
            describe(`${errorCode} error`, () => {
              beforeEach(() => {
                Cypress.on('uncaught:exception', () => false);
                mockStreamError(streamId, 500);
                setupGeneratedAnswer(streamId);
                cy.wait(getStreamInterceptAlias(streamId));
              });

              it('should retry the stream 3 times then offer a retry button', () => {
                for (let times = 0; times < 3; times++) {
                  GeneratedAnswerSelectors.container().should('not.exist');

                  cy.wait(getStreamInterceptAlias(streamId));
                }

                const retryAlias = '@retrySearch';
                cy.intercept({
                  method: 'POST',
                  url: '**/rest/search/v2?*',
                }).as(retryAlias.substring(1));

                GeneratedAnswerSelectors.retryButton().click();

                cy.wait(retryAlias);
              });
            });
          });
        });
      });
    });
  });
});
