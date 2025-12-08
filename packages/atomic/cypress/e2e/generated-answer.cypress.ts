import {RouteAlias, TagProps} from '../fixtures/fixture-common';
import {TestFixture, generateLongTextAnswer} from '../fixtures/test-fixture';
import {AnalyticsTracker} from '../utils/analyticsUtils';
import {
  addGeneratedAnswer,
  getStreamInterceptAlias,
  mockStreamError,
  mockStreamResponse,
} from './generated-answer-actions';
import * as GeneratedAnswerAssertions from './generated-answer-assertions';
import {
  GeneratedAnswerSelectors,
  feedbackModalSelectors,
} from './generated-answer-selectors';

const testCitation = {
  id: 'some-id-123',
  title: 'Some Title',
  uri: 'https://www.coveo.com',
  permanentid: 'some-permanent-id-123',
  clickUri: 'https://www.coveo.com/en',
  text: 'This is the snippet given to the generative model.',
};
const testTextDelta = 'Some text';
const testMessagePayload = {
  payloadType: 'genqa.messageType',
  payload: JSON.stringify({
    textDelta: testTextDelta,
  }),
  finishReason: 'COMPLETED',
};
const testStreamEndPayload = {
  payloadType: 'genqa.endOfStreamType',
  payload: JSON.stringify({
    answerGenerated: true,
    finishReason: 'COMPLETED',
  }),
};
const testCitationsPayload = {
  payloadType: 'genqa.citationsType',
  payload: JSON.stringify({
    citations: [testCitation],
  }),
  finishReason: 'COMPLETED',
};

const testCitationWithEmptyTitle = {
  id: 'some-id-123',
  title: '',
  uri: 'https://www.coveo.com',
  permanentid: 'some-permanent-id-123',
  clickUri: 'https://www.coveo.com/en',
  text: 'This is the snippet given to the generative model.',
};

const testCitationsWithEmptyTitlePayload = {
  payloadType: 'genqa.citationsType',
  payload: JSON.stringify({
    citations: [testCitationWithEmptyTitle],
  }),
  finishReason: 'COMPLETED',
};

describe('Generated Answer Test Suites', () => {
  describe('Generated Answer', () => {
    function setupGeneratedAnswer(streamId?: string, props: TagProps = {}) {
      new TestFixture().with(addGeneratedAnswer(streamId, props)).init();
    }

    function setupGeneratedAnswerWithoutFirstIntercept(
      streamId?: string,
      props: TagProps = {}
    ) {
      new TestFixture()
        .with(addGeneratedAnswer(streamId, props))
        .withoutFirstIntercept()
        .init();
    }

    describe('when no stream ID is returned', () => {
      beforeEach(() => {
        setupGeneratedAnswer();
      });

      it('should not display the component', () => {
        GeneratedAnswerSelectors.container().should('not.exist');
      });
    });

    describe('feedback modal', () => {
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
        GeneratedAnswerSelectors.answer();
      });

      it('should open when an answer is disliked', () => {
        GeneratedAnswerSelectors.dislikeButton().click({force: true});

        feedbackModalSelectors.modalBody().should('exist');
        feedbackModalSelectors.modalHeader().should('exist');
        feedbackModalSelectors.modalFooter().should('exist');
      });

      it('should open when an answer is liked', () => {
        GeneratedAnswerSelectors.likeButton().click({force: true});

        feedbackModalSelectors.modalBody().should('exist');
        feedbackModalSelectors.modalHeader().should('exist');
        feedbackModalSelectors.modalFooter().should('exist');
      });

      describe('select button', () => {
        it('should submit proper feedback', () => {
          GeneratedAnswerSelectors.likeButton().click({force: true});

          feedbackModalSelectors
            .feedbackOption('correctTopic', 'Yes')
            .click({force: true});
          feedbackModalSelectors
            .feedbackOption('hallucinationFree', 'No')
            .click({force: true});

          feedbackModalSelectors.submitButton().click();
          feedbackModalSelectors.submitButton().should('exist');

          feedbackModalSelectors
            .feedbackOption('readable', 'Yes')
            .click({force: true});
          feedbackModalSelectors
            .feedbackOption('documented', 'Yes')
            .click({force: true});

          feedbackModalSelectors.submitButton().click();
          feedbackModalSelectors.submitButton().should('not.exist');
          feedbackModalSelectors.cancelButton().should('exist');

          cy.get(`${RouteAlias.UA}.3`)
            .its('request.body.customData.helpful')
            .should('equal', true);

          cy.get(`${RouteAlias.UA}.3`)
            .its('request.body.customData.correctTopic')
            .should('equal', 'yes');

          cy.get(`${RouteAlias.UA}.3`)
            .its('request.body.customData.hallucinationFree')
            .should('equal', 'no');

          cy.get(`${RouteAlias.UA}.3`)
            .its('request.body.customData.readable')
            .should('equal', 'yes');

          cy.get(`${RouteAlias.UA}.3`)
            .its('request.body.customData.documented')
            .should('equal', 'yes');
        });
      });
    });

    describe('when withToggle prop is NOT provided', () => {
      beforeEach(() => {
        setupGeneratedAnswerWithoutFirstIntercept('dummy-stream-id');
      });

      it('should hide the toggle button', () => {
        GeneratedAnswerAssertions.assertToggleVisibility(false);
      });
    });

    describe('when collapsible prop is provided', () => {
      describe('answer height is more than 250px', () => {
        const streamId = crypto.randomUUID();

        const testTextDelta = generateLongTextAnswer();
        const testMessagePayload = {
          payloadType: 'genqa.messageType',
          payload: JSON.stringify({
            textDelta: testTextDelta,
          }),
          finishReason: 'COMPLETED',
        };

        beforeEach(() => {
          mockStreamResponse(streamId, testMessagePayload);
          setupGeneratedAnswerWithoutFirstIntercept(streamId, {
            collapsible: true,
          });
        });

        GeneratedAnswerAssertions.assertShowButton(true);
        GeneratedAnswerAssertions.assertAnswerCollapsed(true);
        GeneratedAnswerAssertions.assertShowMoreLabel(true);
        GeneratedAnswerAssertions.assertFeedbackButtonsVisibility(false);
        GeneratedAnswerAssertions.assertCopyButtonVisibility(false);

        describe('when we click on show more button', () => {
          beforeEach(() => {
            GeneratedAnswerSelectors.showButton().click();
          });

          GeneratedAnswerAssertions.assertAnswerCollapsed(false);
          GeneratedAnswerAssertions.assertShowMoreLabel(false);
          GeneratedAnswerAssertions.assertFeedbackButtonsVisibility(true);
          GeneratedAnswerAssertions.assertCopyButtonVisibility(true);
        });
      });

      describe('answer height is less than 250px', () => {
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
          setupGeneratedAnswerWithoutFirstIntercept(streamId, {
            collapsible: true,
          });
        });

        GeneratedAnswerAssertions.assertShowButton(false);
        GeneratedAnswerAssertions.assertAnswerCollapsed(false);
        GeneratedAnswerAssertions.assertFeedbackButtonsVisibility(true);
        GeneratedAnswerAssertions.assertCopyButtonVisibility(true);
      });
    });

    describe('when a stream ID is returned', () => {
      describe('when withToggle prop is provided and component is deactivated', () => {
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
          setupGeneratedAnswerWithoutFirstIntercept(streamId, {
            'with-toggle': true,
          });
          cy.wait(getStreamInterceptAlias(streamId));

          GeneratedAnswerSelectors.toggle().click();
        });

        GeneratedAnswerAssertions.assertAnswerVisibility(false);
        GeneratedAnswerAssertions.assertFeedbackButtonsVisibility(false);
        GeneratedAnswerAssertions.assertToggleVisibility(true);
        GeneratedAnswerAssertions.assertToggleValue(false);
        GeneratedAnswerAssertions.assertCopyButtonVisibility(false);
        GeneratedAnswerAssertions.assertLocalStorageData({isVisible: false});
        GeneratedAnswerAssertions.assertLogHideGeneratedAnswer();
        GeneratedAnswerAssertions.assertDisclaimer(false);

        describe('when withToggle prop is provided and component is re-activated', () => {
          beforeEach(() => {
            AnalyticsTracker.reset();
            GeneratedAnswerSelectors.toggle().click();
          });

          GeneratedAnswerAssertions.assertAnswerVisibility(true);
          GeneratedAnswerAssertions.assertFeedbackButtonsVisibility(true);
          GeneratedAnswerAssertions.assertToggleVisibility(true);
          GeneratedAnswerAssertions.assertToggleValue(true);
          GeneratedAnswerAssertions.assertCopyButtonVisibility(true);
          GeneratedAnswerAssertions.assertLocalStorageData({isVisible: true});
          GeneratedAnswerAssertions.assertLogShowGeneratedAnswer();
          GeneratedAnswerAssertions.assertDisclaimer(true);
        });
      });

      describe('when a message event is received', () => {
        const streamId = crypto.randomUUID();

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

        it('should display copy button', () => {
          GeneratedAnswerSelectors.copyButton().should('exist');
        });

        it('should display the disclaimer', () => {
          GeneratedAnswerSelectors.disclaimer().should('exist');
        });

        describe('when like button is clicked', () => {
          beforeEach(() => {
            AnalyticsTracker.reset();
            GeneratedAnswerSelectors.likeButton().click();
          });

          it('should log likeGeneratedAnswer event', () => {
            GeneratedAnswerAssertions.assertLogLikeGeneratedAnswer();
          });
        });

        describe('when dislike button is clicked', () => {
          beforeEach(() => {
            AnalyticsTracker.reset();
            GeneratedAnswerSelectors.dislikeButton().click();
          });

          it('should log dislikeGeneratedAnswer event', () => {
            GeneratedAnswerAssertions.assertLogDislikeGeneratedAnswer();
          });
        });

        describe.skip('when copy button is clicked', () => {
          it('should copy the generated answer to the clipboard', async () => {
            GeneratedAnswerSelectors.copyButton().focus().click();

            GeneratedAnswerAssertions.assertAnswerCopiedToClipboard(
              testTextDelta
            );
          });

          it('should log copyGeneratedAnswer event', async () => {
            AnalyticsTracker.reset();
            GeneratedAnswerSelectors.copyButton().focus().click();

            GeneratedAnswerAssertions.assertLogCopyGeneratedAnswer();
          });
        });
      });

      describe('when a citation event is received', () => {
        const streamId = crypto.randomUUID();

        beforeEach(() => {
          mockStreamResponse(streamId, testCitationsPayload);
          setupGeneratedAnswer(streamId);
          cy.wait(getStreamInterceptAlias(streamId));
          cy.wait(1000);
        });

        it('should display the citation link', () => {
          GeneratedAnswerSelectors.citationsLabel().should(
            'have.text',
            'Citations'
          );
          GeneratedAnswerSelectors.citationTitle().should(
            'have.text',
            testCitation.title
          );
          GeneratedAnswerSelectors.citation().should(
            'have.attr',
            'href',
            testCitation.clickUri
          );
        });

        describe('when a citation is hovered', () => {
          beforeEach(() => {
            AnalyticsTracker.reset();
            cy.clock();
            GeneratedAnswerSelectors.citation().trigger('mouseover');
            cy.tick(1300).invoke('restore');
          });

          it('should display the citation card', () => {
            GeneratedAnswerSelectors.citationCard().should('be.visible');
            GeneratedAnswerSelectors.citationCard().should(
              'contain.text',
              testCitation.uri
            );
            GeneratedAnswerSelectors.citationCard().should(
              'contain.text',
              testCitation.title
            );
            GeneratedAnswerSelectors.citationCard().should(
              'contain.text',
              testCitation.text
            );
          });

          it('should send analytics when the hover ends', () => {
            GeneratedAnswerSelectors.citation().trigger('mouseleave');

            GeneratedAnswerAssertions.assertLogGeneratedAnswerSourceHover();
          });
        });

        describe('when a citation is clicked', () => {
          beforeEach(() => {
            AnalyticsTracker.reset();
            GeneratedAnswerSelectors.citation().click();
          });

          it('should log an openGeneratedAnswerSource click event', () => {
            GeneratedAnswerAssertions.assertLogOpenGeneratedAnswerSource();
          });
        });

        describe('when a citation is right-clicked', () => {
          beforeEach(() => {
            AnalyticsTracker.reset();
            GeneratedAnswerSelectors.citation().rightclick();
          });

          it('should log an openGeneratedAnswerSource click event', () => {
            GeneratedAnswerAssertions.assertLogOpenGeneratedAnswerSource();
          });
        });
      });

      describe('When a citation event is received with empty title', () => {
        const streamId = crypto.randomUUID();

        beforeEach(() => {
          mockStreamResponse(streamId, testCitationsWithEmptyTitlePayload);
          setupGeneratedAnswer(streamId);
          cy.wait(getStreamInterceptAlias(streamId));
        });

        it('should display the citation with no title label', () => {
          GeneratedAnswerSelectors.citationCard().should(
            'contain.text',
            'No title'
          );
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

      describe('when streamEnd event is received', () => {
        const streamId = crypto.randomUUID();

        beforeEach(() => {
          mockStreamResponse(streamId, [
            {...testMessagePayload, finishReason: null},
            testStreamEndPayload,
          ]);
          setupGeneratedAnswer(streamId);
          cy.wait(getStreamInterceptAlias(streamId));
        });

        it('should log the streamEnd event', () => {
          GeneratedAnswerAssertions.assertLogGeneratedAnswerStreamEnd();
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
                mockStreamError(streamId, errorCode);
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
