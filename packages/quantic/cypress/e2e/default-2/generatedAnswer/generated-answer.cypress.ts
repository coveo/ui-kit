/* eslint-disable @cspell/spellchecker */
import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {analyticsModeTest} from '../../../page-objects/analytics';
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
import {
  useCaseEnum,
  useCaseParamTest,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {scope} from '../../../reporters/detailed-collector';
import {setCookieToEnableNextAnalytics} from '../../../utils/analytics-utils';
import {NextAnalyticsExpectations} from '../../next-analytics-expectations';
import {GeneratedAnswerActions as Actions} from './generated-answer-actions';
import {GeneratedAnswerExpectations as Expect} from './generated-answer-expectations';

interface GeneratedAnswerOptions {
  answerStyle: string;
  multilineFooter: boolean;
  fieldsToIncludeInCitations: string;
  useCase: string;
  collapsible: boolean;
}

let analyticsMode: 'legacy' | 'next' = 'legacy';
const exampleTrackingId = 'tracking_id_123';
const answerType = 'RGA';

const GENERATED_ANSWER_DATA_KEY = 'coveo-generated-answer-data';
const otherOption = 'other';
const feedbackOptions = [
  'irrelevant',
  'notAccurate',
  'outOfDate',
  'harmful',
  otherOption,
];

const defaultFieldsToIncludeInCitations = 'sfid,sfkbid,sfkavid';
const defaultRephraseOption = 'default';
const stepRephraseOption = 'step';
const bulletRephraseOption = 'bullet';
const conciseRephraseOption = 'concise';

const rephraseOptions = [
  stepRephraseOption,
  bulletRephraseOption,
  conciseRephraseOption,
];

const testText = 'Some text';
const genQaMessageTypePayload = {
  payloadType: 'genqa.messageType',
  payload: JSON.stringify({
    textDelta: testText,
  }),
  finishReason: 'COMPLETED',
};

const testLongText = `Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.

There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water-gazers there.`;
const genQaLongMessageTypePayload = {
  payloadType: 'genqa.messageType',
  payload: JSON.stringify({
    textDelta: testLongText,
  }),
  finishReason: 'COMPLETED',
};

const retryableErrorCodes = [500, 429];

const GENERATED_ANSWER_DISCLAIMER =
  'Generated content may contain errors. Verify important information.';

describe('quantic-generated-answer', () => {
  beforeEach(() => {
    cy.clock(0, ['Date']);
  });

  afterEach(() => {
    cy.clock().then((clock) => {
      clock.restore();
    });
  });

  const pageUrl = 's/quantic-generated-answer';

  function visitGeneratedAnswer(options: Partial<GeneratedAnswerOptions> = {}) {
    if (analyticsMode === 'next') {
      setCookieToEnableNextAnalytics(exampleTrackingId);
    }
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      setupInsightUseCase();
    }
  }

  function setupInsightUseCase() {
    InsightInterfaceExpect.isInitialized();
    performSearch();
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      describe('when no stream ID is returned', () => {
        beforeEach(() => {
          mockSearchWithoutGeneratedAnswer;
          visitGeneratedAnswer({useCase: param.useCase});
        });

        it('should not display the component', () => {
          Expect.displayGeneratedAnswerCard(false);
        });
      });

      describe('when stream ID is returned', () => {
        describe('when a message event is received', () => {
          const streamId = crypto.randomUUID();

          beforeEach(() => {
            mockSearchWithGeneratedAnswer(streamId, param.useCase);
            mockStreamResponse(streamId, genQaMessageTypePayload);
            visitGeneratedAnswer({useCase: param.useCase});
          });

          it('should log the stream ID in the search event custom data', () => {
            if (analyticsMode === 'legacy') {
              Expect.logStreamIdInAnalytics(streamId, param.useCase);
            }
          });

          it('should display the generated answer content', () => {
            Expect.displayGeneratedAnswerContent(true);
            Expect.sessionStorageContains(GENERATED_ANSWER_DATA_KEY, {});
            Expect.generatedAnswerFooterRowsIsOnMultiline(false);
            Expect.generatedAnswerCollapsed(false);
          });

          it('should display the correct message', () => {
            Expect.displayGeneratedAnswerCard(true);
            Expect.generatedAnswerContains(testText);
            Expect.generatedAnswerIsStreaming(false);
          });

          it('should display the disclaimer', () => {
            Expect.displayDisclaimer(true);
            Expect.disclaimerContains(GENERATED_ANSWER_DISCLAIMER);
            Expect.generatedAnswerIsStreaming(false);
          });

          it('should perform a search query with the default rephrase button', () => {
            cy.wait(InterceptAliases.Search);
            Expect.searchQueryContainsCorrectRephraseOption(
              defaultRephraseOption,
              param.useCase === 'search' ? 'interfaceLoad' : 'searchboxSubmit'
            );
          });

          it('should perform a search query with the default fields to include in citations', () => {
            cy.wait(InterceptAliases.Search);
            Expect.searchQueryContainsCorrectFieldsToIncludeInCitations(
              defaultFieldsToIncludeInCitations.split(',')
            );
          });

          it('should display the rephrase buttons', () => {
            Expect.displayRephraseButtons(true);
            Expect.displayRephraseLabel(true);
          });

          it('should display feedback buttons', () => {
            Expect.displayLikeButton(true);
            Expect.displayDislikeButton(true);
            Expect.likeButtonIsChecked(false);
            Expect.dislikeButtonIsChecked(false);
          });
        });

        describe('when a value is provided to the answer style attribute', () => {
          const streamId = crypto.randomUUID();

          beforeEach(() => {
            mockSearchWithGeneratedAnswer(streamId, param.useCase);
            mockStreamResponse(streamId, genQaMessageTypePayload);
            visitGeneratedAnswer({
              answerStyle: bulletRephraseOption,
              useCase: param.useCase,
            });
          });

          it('should send a search query with the right rephrase option as a parameter', () => {
            scope('when loading the page', () => {
              Expect.displayRephraseButtons(true);
              Expect.rephraseButtonIsSelected(stepRephraseOption, false);
              Expect.rephraseButtonIsSelected(conciseRephraseOption, false);
              Expect.rephraseButtonIsSelected(bulletRephraseOption, true);
              Expect.searchQueryContainsCorrectRephraseOption(
                bulletRephraseOption,
                param.useCase === 'search' ? 'interfaceLoad' : 'searchboxSubmit'
              );
            });
          });
        });

        describe('when a custom value is provided to the fields to include in citations attribute', () => {
          const streamId = crypto.randomUUID();
          const customFields = 'foo,bar';

          beforeEach(() => {
            mockSearchWithGeneratedAnswer(streamId, param.useCase);
            mockStreamResponse(streamId, genQaMessageTypePayload);
            visitGeneratedAnswer({
              fieldsToIncludeInCitations: customFields,
              useCase: param.useCase,
            });
          });

          it('should send a search query with the right fields to include in citations option as a parameter', () => {
            scope('when loading the page', () => {
              Expect.displayGeneratedAnswerContent(true);
              Expect.displayRephraseButtons(true);
              Expect.searchQueryContainsCorrectFieldsToIncludeInCitations(
                customFields.split(',')
              );
            });
          });
        });

        describe('when the property multilineFooter is set to true', () => {
          const streamId = crypto.randomUUID();

          beforeEach(() => {
            mockSearchWithGeneratedAnswer(streamId, param.useCase);
            mockStreamResponse(streamId, genQaMessageTypePayload);
            visitGeneratedAnswer({
              multilineFooter: true,
              useCase: param.useCase,
            });
          });

          it('should properly display the generated answer footer on multiple lines', () => {
            scope('when loading the page', () => {
              Expect.displayGeneratedAnswerCard(true);
              Expect.generatedAnswerFooterRowsIsOnMultiline(true);
              Expect.displayDisclaimer(true);
            });
          });
        });

        describe('when the collapsible property is set to true', () => {
          it('should properly display the generated answer collapsed when the answer is too long', () => {
            const streamId = crypto.randomUUID();

            mockSearchWithGeneratedAnswer(streamId, param.useCase);
            mockStreamResponse(streamId, genQaLongMessageTypePayload);
            visitGeneratedAnswer({
              collapsible: true,
              useCase: param.useCase,
            });

            scope('when loading the page', () => {
              Expect.displayGeneratedAnswerCard(true);
              Expect.generatedAnswerCollapsed(true);
              Expect.displayGeneratedAnswerToggleCollapseButton(true);
              Expect.generatedAnswerToggleCollapseButtonContains('Show more');
              Expect.displayCitations(false);
              Expect.displayRephraseButtons(false);
              Expect.displayDisclaimer(true);
            });

            scope('when clicking the toggle collapse button', () => {
              Actions.clickToggleCollapseButton();
              // TODO: Expect analytics to be sent
              Expect.generatedAnswerCollapsed(false);
              Expect.generatedAnswerToggleCollapseButtonContains('Show less');
              Expect.displayCitations(false);
              Expect.displayRephraseButtons(true);
              Expect.displayDisclaimer(true);
            });

            scope(
              'when clicking the toggle collapse button a second time',
              () => {
                Actions.clickToggleCollapseButton();
                // TODO: Expect analytics to be sent
                Expect.generatedAnswerCollapsed(true);
                Expect.generatedAnswerToggleCollapseButtonContains('Show more');
                Expect.displayCitations(false);
                Expect.displayRephraseButtons(false);
                Expect.displayDisclaimer(true);
              }
            );
          });

          it('should not display the answer collapsed when the answer is short', () => {
            const newStreamId = crypto.randomUUID();

            mockSearchWithGeneratedAnswer(newStreamId, param.useCase);
            mockStreamResponse(newStreamId, genQaMessageTypePayload);
            visitGeneratedAnswer({
              collapsible: true,
              useCase: param.useCase,
            });

            scope('when loading the page', () => {
              Expect.displayGeneratedAnswerCard(true);
              Expect.generatedAnswerCollapsed(false);
              Expect.displayGeneratedAnswerToggleCollapseButton(false);
              Expect.displayRephraseButtons(true);
              Expect.displayDisclaimer(true);
            });
          });
        });

        describe('when the generated answer is still streaming', () => {
          const streamId = crypto.randomUUID();

          const testMessagePayload = {
            payloadType: 'genqa.messageType',
            payload: JSON.stringify({
              textDelta: testText,
            }),
          };

          beforeEach(() => {
            mockSearchWithGeneratedAnswer(streamId, param.useCase);
            mockStreamResponse(streamId, testMessagePayload);
            visitGeneratedAnswer({useCase: param.useCase});
          });

          it('should display the correct message and the streaming cursor', () => {
            Expect.displayGeneratedAnswerCard(true);
            Expect.generatedAnswerContains(testText);
            Expect.generatedAnswerIsStreaming(true);
            Expect.displayRephraseButtons(false);
            Expect.displayLikeButton(false);
            Expect.displayDislikeButton(false);
            Expect.displayCopyToClipboardButton(false);
            Expect.displayToggleGeneratedAnswerButton(true);
            Expect.toggleGeneratedAnswerButtonIsChecked(true);
            Expect.displayDisclaimer(false);
          });
        });

        rephraseOptions.forEach((option) => {
          const rephraseOption = option;

          describe(`when clicking the ${rephraseOption} rephrase button`, () => {
            const streamId = crypto.randomUUID();
            const secondStreamId = crypto.randomUUID();

            beforeEach(() => {
              mockSearchWithGeneratedAnswer(streamId, param.useCase);
              mockStreamResponse(streamId, genQaMessageTypePayload);
              visitGeneratedAnswer({useCase: param.useCase});
            });

            it(`should send a new search query with the rephrase option ${option} as a parameter`, () => {
              scope('when loading the page', () => {
                Expect.displayRephraseButtonWithLabel(rephraseOption);
                const expectedRephraseButtonSelected =
                  option === defaultRephraseOption;
                Expect.rephraseButtonIsSelected(
                  rephraseOption,
                  expectedRephraseButtonSelected
                );
              });

              scope('when selecting the rephrase button', () => {
                mockSearchWithGeneratedAnswer(secondStreamId, param.useCase);
                mockStreamResponse(secondStreamId, genQaMessageTypePayload);

                Actions.clickRephraseButton(rephraseOption);
                Expect.displayRephraseButtonWithLabel(rephraseOption);
                Expect.rephraseButtonIsSelected(rephraseOption, true);
                rephraseOptions
                  .filter((item) => {
                    return item !== rephraseOption;
                  })
                  .forEach((unselectedOption) => {
                    Expect.displayRephraseButtonWithLabel(unselectedOption);
                    Expect.rephraseButtonIsSelected(unselectedOption, false);
                  });
                Expect.searchQueryContainsCorrectRephraseOption(
                  rephraseOption,
                  'rephraseGeneratedAnswer'
                );
                if (analyticsMode === 'legacy') {
                  Expect.logRephraseGeneratedAnswer(
                    rephraseOption,
                    secondStreamId
                  );
                }
              });
            });
          });
        });

        describe('when an end of stream event is received', () => {
          const streamId = crypto.randomUUID();

          const testMessagePayload = {
            payloadType: 'genqa.endOfStreamType',
            payload: JSON.stringify({
              textDelta: testText,
            }),
            finishReason: 'COMPLETED',
          };

          beforeEach(() => {
            mockSearchWithGeneratedAnswer(streamId, param.useCase);
            mockStreamResponse(streamId, testMessagePayload);
            visitGeneratedAnswer({useCase: param.useCase});
          });

          it('should log the generated answer stream end event', () => {
            if (analyticsMode === 'legacy') {
              Expect.logGeneratedAnswerStreamEnd(streamId);
            }
          });
        });

        analyticsModeTest.forEach((analytics) => {
          describe(analytics.label, () => {
            before(() => {
              analyticsMode = analytics.mode;
            });

            describe('when liking the generated answer', () => {
              const streamId = crypto.randomUUID();
              const responseId = crypto.randomUUID();

              beforeEach(() => {
                mockSearchWithGeneratedAnswer(
                  streamId,
                  param.useCase,
                  responseId
                );
                mockStreamResponse(streamId, genQaMessageTypePayload);
                visitGeneratedAnswer({useCase: param.useCase});
              });

              it('should properly display the like button', () => {
                Expect.displayLikeButton(true);
                Expect.displayDislikeButton(true);
                Expect.likeButtonIsChecked(false);
                Expect.dislikeButtonIsChecked(false);

                scope('should properly log the analytics', () => {
                  Actions.likeGeneratedAnswer();
                  if (analyticsMode === 'next') {
                    NextAnalyticsExpectations.emitQnaLikeEvent(
                      {
                        feedback: {
                          liked: true,
                        },
                        answer: {
                          responseId,
                          type: answerType,
                        },
                      },
                      exampleTrackingId
                    );
                  } else {
                    Expect.logLikeGeneratedAnswer(streamId);
                  }
                  Expect.likeButtonIsChecked(true);
                  Expect.dislikeButtonIsChecked(false);
                });
              });
            });

            // The Salesforce lightning-modal is very flaky, sometimes throwing random errors in Cypress test runs.
            // We are skipping this test for now until we can find a more reliable way to test it.
            // Common stack trace when clicking on the dislike: `Cannot read properties of null (reading 'appendChild')`
            xdescribe(
              'when providing detailed feedback',
              {
                retries: 5,
              },
              () => {
                const streamId = crypto.randomUUID();
                const responseId = crypto.randomUUID();

                beforeEach(() => {
                  mockSearchWithGeneratedAnswer(
                    streamId,
                    param.useCase,
                    responseId
                  );
                  mockStreamResponse(streamId, genQaMessageTypePayload);
                  visitGeneratedAnswer({useCase: param.useCase});
                });

                it('should send detailed feedback', () => {
                  const exampleDetails = 'example details';

                  Expect.displayLikeButton(true);
                  Expect.displayDislikeButton(true);
                  Expect.likeButtonIsChecked(false);
                  Expect.dislikeButtonIsChecked(false);

                  scope('when disliking the generated answer', () => {
                    Actions.dislikeGeneratedAnswer();
                    if (analyticsMode === 'next') {
                      NextAnalyticsExpectations.emitQnaDislikeEvent(
                        {
                          feedback: {
                            liked: false,
                          },
                          answer: {
                            responseId,
                            type: answerType,
                          },
                        },
                        exampleTrackingId
                      );
                    } else {
                      Expect.logGeneratedAnswerFeedbackSubmit(streamId, {
                        reason: otherOption,
                        details: exampleDetails,
                      });
                    }
                    Actions.clickFeedbackDoneButton();
                  });

                  scope('when trying to open the feedback modal again', () => {
                    Actions.dislikeGeneratedAnswer();
                    Expect.displayFeedbackModal(false);
                  });

                  scope(
                    'when trying to open the feedback modal after rephrasing the generated answer',
                    () => {
                      const secondStreamId = crypto.randomUUID();

                      mockSearchWithGeneratedAnswer(
                        secondStreamId,
                        param.useCase
                      );
                      mockStreamResponse(
                        secondStreamId,
                        genQaMessageTypePayload
                      );
                      Actions.clickRephraseButton(rephraseOptions[0]);
                      Actions.dislikeGeneratedAnswer();
                      Expect.displayFeedbackModal(true);
                      Actions.clickFeedbackOption(
                        feedbackOptions.indexOf(otherOption)
                      );
                      Actions.typeInFeedbackDetailsInput(exampleDetails);
                      Actions.clickFeedbackSubmitButton();
                      if (analyticsMode === 'next') {
                        NextAnalyticsExpectations.emitQnaSubmitFeedbackReasonEvent(
                          {
                            feedback: {
                              liked: false,
                              details: exampleDetails,
                              reason: 'other',
                            },
                            answer: {
                              responseId,
                              type: answerType,
                            },
                          },
                          exampleTrackingId
                        );
                      } else {
                        Expect.logGeneratedAnswerFeedbackSubmit(
                          secondStreamId,
                          {
                            reason: otherOption,
                            details: exampleDetails,
                          }
                        );
                      }

                      Actions.clickFeedbackDoneButton();
                    }
                  );

                  scope(
                    'when trying to open the feedback modal after executing a new query',
                    () => {
                      const thirdStreamId = crypto.randomUUID();

                      mockSearchWithGeneratedAnswer(
                        thirdStreamId,
                        param.useCase
                      );
                      mockStreamResponse(
                        thirdStreamId,
                        genQaMessageTypePayload
                      );
                      performSearch();
                      Actions.dislikeGeneratedAnswer();
                      Expect.displayFeedbackModal(false);
                    }
                  );

                  scope(
                    'when trying to open the feedback modal after rephrasing the generated answer',
                    () => {
                      const secondStreamId = crypto.randomUUID();
                      const secondResponseId = crypto.randomUUID();

                      mockSearchWithGeneratedAnswer(
                        secondStreamId,
                        param.useCase,
                        secondResponseId
                      );
                      mockStreamResponse(
                        secondStreamId,
                        genQaMessageTypePayload
                      );
                      Actions.clickRephraseButton(rephraseOptions[0]);
                      Actions.dislikeGeneratedAnswer();
                      Expect.displayFeedbackModal(true);
                      Actions.clickFeedbackOption(
                        feedbackOptions.indexOf(otherOption)
                      );
                      Actions.typeInFeedbackDetailsInput(exampleDetails);
                      Actions.clickFeedbackSubmitButton();
                      if (analyticsMode === 'next') {
                        NextAnalyticsExpectations.emitQnaSubmitFeedbackReasonEvent(
                          {
                            feedback: {
                              liked: false,
                              details: exampleDetails,
                              reason: 'other',
                            },
                            answer: {
                              responseId: secondResponseId,
                              type: answerType,
                            },
                          },
                          exampleTrackingId
                        );
                      } else {
                        Expect.logGeneratedAnswerFeedbackSubmit(
                          secondStreamId,
                          {
                            reason: otherOption,
                            details: exampleDetails,
                          }
                        );
                      }

                      Actions.clickFeedbackDoneButton();
                    }
                  );

                  scope(
                    'when trying to open the feedback modal after executing a new query',
                    () => {
                      const thirdStreamId = crypto.randomUUID();
                      const thirdResponseId = crypto.randomUUID();

                      mockSearchWithGeneratedAnswer(
                        thirdStreamId,
                        param.useCase,
                        thirdResponseId
                      );
                      mockStreamResponse(
                        thirdStreamId,
                        genQaMessageTypePayload
                      );
                      performSearch();
                      Actions.dislikeGeneratedAnswer();
                      Expect.displayFeedbackModal(true);
                      Actions.clickFeedbackOption(
                        feedbackOptions.indexOf(otherOption)
                      );
                      Actions.typeInFeedbackDetailsInput(exampleDetails);
                      Actions.clickFeedbackSubmitButton();
                      if (analyticsMode === 'next') {
                        NextAnalyticsExpectations.emitQnaSubmitFeedbackReasonEvent(
                          {
                            feedback: {
                              liked: false,
                              details: exampleDetails,
                              reason: 'other',
                            },
                            answer: {
                              responseId: thirdResponseId,
                              type: answerType,
                            },
                          },
                          exampleTrackingId
                        );
                      } else {
                        Expect.logGeneratedAnswerFeedbackSubmit(thirdStreamId, {
                          reason: otherOption,
                          details: exampleDetails,
                        });
                      }

                      Actions.clickFeedbackDoneButton();
                    }
                  );
                });
              }
            );

            describe('the generated answer toggle button', () => {
              const streamId = crypto.randomUUID();
              const responseId = crypto.randomUUID();

              beforeEach(() => {
                mockSearchWithGeneratedAnswer(
                  streamId,
                  param.useCase,
                  responseId
                );
                mockStreamResponse(streamId, genQaMessageTypePayload);
                visitGeneratedAnswer({useCase: param.useCase});
              });

              it('should display the toggle generated answer button', () => {
                Expect.displayToggleGeneratedAnswerButton(true);
                Expect.toggleGeneratedAnswerButtonIsChecked(true);

                scope('when toggling off the generated answer', () => {
                  Actions.clickToggleGeneratedAnswerButton();
                  Expect.toggleGeneratedAnswerButtonIsChecked(false);
                  Expect.displayGeneratedAnswerContent(false);
                  Expect.displayLikeButton(false);
                  Expect.displayDislikeButton(false);
                  Expect.displayDisclaimer(false);
                  if (analyticsMode === 'next') {
                    NextAnalyticsExpectations.emitQnaAnswerActionEvent(
                      {
                        answer: {
                          responseId,
                          type: answerType,
                        },
                        action: 'hide',
                      },
                      exampleTrackingId
                    );
                  } else {
                    Expect.logHideGeneratedAnswer(streamId);
                  }
                  Expect.sessionStorageContains(GENERATED_ANSWER_DATA_KEY, {
                    isVisible: false,
                  });
                });

                scope('when toggling on the generated answer', () => {
                  Actions.clickToggleGeneratedAnswerButton();
                  Expect.toggleGeneratedAnswerButtonIsChecked(true);
                  Expect.displayGeneratedAnswerContent(true);
                  Expect.displayLikeButton(true);
                  Expect.displayDislikeButton(true);
                  if (analyticsMode === 'next') {
                    NextAnalyticsExpectations.emitQnaAnswerActionEvent(
                      {
                        answer: {
                          responseId,
                          type: answerType,
                        },
                        action: 'show',
                      },
                      exampleTrackingId
                    );
                  } else {
                    Expect.logShowGeneratedAnswer(streamId);
                  }
                  Expect.sessionStorageContains(GENERATED_ANSWER_DATA_KEY, {
                    isVisible: true,
                  });
                });
              });
            });

            // access to the clipboard reliably works in Electron browser
            // in other browsers, there are popups asking for permission
            // thus we should only run these tests in Electron
            describe(
              'when clicking the copy to clipboard button',
              {browser: 'electron'},
              () => {
                const streamId = crypto.randomUUID();
                const responseId = crypto.randomUUID();

                beforeEach(() => {
                  mockSearchWithGeneratedAnswer(
                    streamId,
                    param.useCase,
                    responseId
                  );
                  mockStreamResponse(streamId, genQaMessageTypePayload);
                  visitGeneratedAnswer({
                    multilineFooter: true,
                    useCase: param.useCase,
                  });
                });

                it('should properly copy the answer to clipboard', () => {
                  scope('when loading the page', () => {
                    Expect.displayCopyToClipboardButton(true);
                    Actions.clickCopyToClipboardButton();
                    if (analyticsMode === 'next') {
                      NextAnalyticsExpectations.emitQnaAnswerActionEvent(
                        {
                          answer: {
                            responseId,
                            type: answerType,
                          },
                          action: 'copyToClipboard',
                        },
                        exampleTrackingId
                      );
                    } else {
                      Expect.logCopyGeneratedAnswer(streamId);
                    }
                    cy.window().then((win) => {
                      win.navigator.clipboard.readText().then((text) => {
                        expect(text).to.eq(testText);
                      });
                    });
                  });
                });
              }
            );

            describe('when a citation event is received', () => {
              const exampleLinkUrl = '#';
              const streamId = crypto.randomUUID();
              const responseId = crypto.randomUUID();
              const firstTestCitation = {
                id: 'some-id-1',
                title: 'Some Title 1',
                uri: 'https://www.coveo.com',
                permanentid: 'some-permanent-id-1',
                clickUri: exampleLinkUrl,
                text: 'example text 1',
              };
              const secondTestCitation = {
                id: 'some-id-2',
                title: 'Some Title 2',
                uri: 'https://www.coveo.com',
                permanentid: 'some-permanent-id-2',
                clickUri: exampleLinkUrl,
                text: 'example text 2',
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
                mockSearchWithGeneratedAnswer(
                  streamId,
                  param.useCase,
                  responseId
                );
                mockStreamResponse(streamId, testMessagePayload);
                visitGeneratedAnswer({useCase: param.useCase});
              });

              it('should properly display the source citations', () => {
                Expect.displayCitations(true);
                testCitations.forEach((citation, index) => {
                  Expect.citationTitleContains(index, citation.title);
                  Expect.citationNumberContains(index, `${index + 1}`);
                  Expect.citationLinkContains(index, citation.clickUri);
                });
              });

              describe('hovering over a generated answer citation', () => {
                const hoveredCitationIndex = 0;

                it('should properly display the tooltip', () => {
                  Expect.displayCitations(true);
                  testCitations.forEach((citation, index) => {
                    Expect.citationTooltipIsDisplayed(index, false);
                    Actions.hoverOverCitation(index);
                    Expect.citationTooltipIsDisplayed(index, true);
                    Expect.citationTooltipUrlContains(index, citation.clickUri);
                    Expect.citationTooltipTitleContains(index, citation.title);
                    Expect.citationTooltipTextContains(index, citation.text);
                  });
                });

                it('should log the analytics only after hovering more than 1000ms', () => {
                  Expect.citationTooltipIsDisplayed(
                    hoveredCitationIndex,
                    false
                  );

                  Actions.hoverOverCitation(0);
                  Expect.citationTooltipIsDisplayed(hoveredCitationIndex, true);
                  cy.tick(1000);
                  Actions.stopHoverOverCitation(0);
                  if (analyticsMode === 'next') {
                    NextAnalyticsExpectations.emitQnaCitationHover(
                      {
                        answer: {
                          responseId,
                          type: answerType,
                        },
                        citation: {
                          id: testCitations[hoveredCitationIndex].id,
                          type: 'Source',
                        },
                      },
                      exampleTrackingId
                    );
                  } else {
                    Expect.logHoverGeneratedAnswerSource(
                      streamId,
                      testCitations[hoveredCitationIndex]
                    );
                  }

                  Expect.citationTooltipIsDisplayed(
                    hoveredCitationIndex,
                    false
                  );
                });
              });

              it('should log the correct analytics event when a citation is clicked', () => {
                const clickedCitationIndex = 0;

                Expect.displayCitations(true);

                Actions.clickCitation(0);
                if (analyticsMode === 'next') {
                  NextAnalyticsExpectations.emitQnaCitationClick(
                    {
                      answer: {
                        responseId,
                        type: answerType,
                      },
                      citation: {
                        id: testCitations[clickedCitationIndex].id,
                        type: 'Source',
                      },
                    },
                    exampleTrackingId
                  );
                } else {
                  Expect.logOpenGeneratedAnswerSource(
                    streamId,
                    testCitations[clickedCitationIndex]
                  );
                }
              });
            });
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
            mockSearchWithGeneratedAnswer(streamId, param.useCase);
            mockStreamResponse(streamId, testErrorPayload);
            visitGeneratedAnswer({useCase: param.useCase});
          });

          it('should not display the component', () => {
            Expect.displayGeneratedAnswerCard(false);
          });
        });

        describe('when the stream connection fails', () => {
          const streamId = crypto.randomUUID();

          describe('Non-retryable error (4XX)', () => {
            beforeEach(() => {
              mockSearchWithGeneratedAnswer(streamId, param.useCase);
              mockStreamError(streamId, 406);
              visitGeneratedAnswer({useCase: param.useCase});
              cy.wait(getStreamInterceptAlias(streamId));
            });

            it('should not show the component', () => {
              Expect.displayGeneratedAnswerCard(false);
            });
          });

          describe('Retryable error', () => {
            retryableErrorCodes.forEach((errorCode) => {
              describe(`${errorCode} error`, () => {
                beforeEach(() => {
                  mockSearchWithGeneratedAnswer(streamId, param.useCase);
                  mockStreamError(streamId, errorCode);
                  visitGeneratedAnswer({useCase: param.useCase});
                });

                it('should retry the stream 3 times then offer a retry button', () => {
                  for (let times = 0; times < 3; times++) {
                    Expect.displayGeneratedAnswerCard(false);
                    cy.wait(getStreamInterceptAlias(streamId));
                  }
                  Expect.displayGeneratedAnswerCard(true);
                  Expect.displayDisclaimer(false);

                  Actions.clickRetry();
                  cy.wait(InterceptAliases.Search);
                  if (analyticsMode === 'legacy') {
                    Expect.logRetryGeneratedAnswer(streamId);
                  }
                });
              });
            });
          });
        });
      });
    });
  });
});
