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
  fieldsToIncludeInCitations: string;
  useCase: string;
  collapsible: boolean;
  withToggle: boolean;
}

let analyticsMode: 'legacy' | 'next' = 'legacy';
const exampleTrackingId = 'tracking_id_123';
const answerType = 'RGA';

const GENERATED_ANSWER_DATA_KEY = 'coveo-generated-answer-data';

const defaultFieldsToIncludeInCitations = 'sfid,sfkbid,sfkavid';

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
        describe('when the completed message event is received', () => {
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
            Expect.generatedAnswerCollapsed(false);
            Expect.displayToggleGeneratedAnswerButton(false);
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

          it('should perform a search query with the default fields to include in citations', () => {
            cy.wait(InterceptAliases.Search);
            Expect.searchQueryContainsCorrectFieldsToIncludeInCitations(
              defaultFieldsToIncludeInCitations.split(',')
            );
          });

          it('should display feedback buttons', () => {
            Expect.displayLikeButton(true);
            Expect.displayDislikeButton(true);
            Expect.likeButtonIsChecked(false);
            Expect.dislikeButtonIsChecked(false);
          });
        });

        describe('handling text/markdown', () => {
          const streamId = crypto.randomUUID();
          const genQaMarkdownTypePayload = {
            payloadType: 'genqa.headerMessageType',
            payload: JSON.stringify({
              contentFormat: 'text/markdown',
            }),
          };

          beforeEach(() => {
            mockSearchWithGeneratedAnswer(streamId, param.useCase);
          });

          it('should display the generated answer content in markdown format', () => {
            const genQaMarkdownTextPayload = {
              payloadType: 'genqa.messageType',
              payload: JSON.stringify({
                textDelta: '# Some markdown text',
              }),
              finishReason: 'COMPLETED',
            };
            mockStreamResponse(streamId, [
              genQaMarkdownTypePayload,
              genQaMarkdownTextPayload,
            ]);
            visitGeneratedAnswer({
              useCase: param.useCase,
            });
            Expect.displayGeneratedAnswerCard(true);
          });

          it('should properly create divs instead of headings', () => {
            const genQaMarkdownTextPayload = {
              payloadType: 'genqa.messageType',
              payload: JSON.stringify({
                textDelta: '# level1\n ## level2\n ### level3',
              }),
              finishReason: 'COMPLETED',
            };
            mockStreamResponse(streamId, [
              genQaMarkdownTypePayload,
              genQaMarkdownTextPayload,
            ]);
            visitGeneratedAnswer({
              useCase: param.useCase,
            });
            Expect.displayGeneratedAnswerCard(true);
            Expect.generatedAnswerContentContainsHTML(
              'div[data-level="answer-heading-1"]'
            );
            Expect.generatedAnswerContentContainsText('level1');
            Expect.generatedAnswerContentContainsHTML(
              'div[data-level="answer-heading-2"]'
            );
            Expect.generatedAnswerContentContainsText('level2');
            Expect.generatedAnswerContentContainsHTML(
              'div[data-level="answer-heading-3"]'
            );
            Expect.generatedAnswerContentContainsText('level3');
          });

          it('should properly close bold tags even before receiving the closing tag', () => {
            const genQaMarkdownTextPayload = {
              payloadType: 'genqa.messageType',
              payload: JSON.stringify({
                textDelta: '**bold text',
              }),
              finishReason: 'COMPLETED',
            };
            mockStreamResponse(streamId, [
              genQaMarkdownTypePayload,
              genQaMarkdownTextPayload,
            ]);
            visitGeneratedAnswer({
              useCase: param.useCase,
            });
            Expect.displayGeneratedAnswerCard(true);
            Expect.generatedAnswerContentContainsHTML('strong');
            Expect.generatedAnswerContentContainsText('bold text');
          });

          it('should properly close code tags even before receiving the closing tag', () => {
            const genQaMarkdownTextPayload = {
              payloadType: 'genqa.messageType',
              payload: JSON.stringify({
                textDelta: '`code text',
              }),
              finishReason: 'COMPLETED',
            };
            mockStreamResponse(streamId, [
              genQaMarkdownTypePayload,
              genQaMarkdownTextPayload,
            ]);
            visitGeneratedAnswer({
              useCase: param.useCase,
            });
            Expect.displayGeneratedAnswerCard(true);
            Expect.generatedAnswerContentContainsHTML('code');
            Expect.generatedAnswerContentContainsText('code text');
          });

          it('should properly render lists as ul and li', () => {
            const genQaMarkdownTextPayload = {
              payloadType: 'genqa.messageType',
              payload: JSON.stringify({
                textDelta: '- list item 1\n- list item 2',
              }),
              finishReason: 'COMPLETED',
            };
            mockStreamResponse(streamId, [
              genQaMarkdownTypePayload,
              genQaMarkdownTextPayload,
            ]);
            visitGeneratedAnswer({
              useCase: param.useCase,
            });
            Expect.displayGeneratedAnswerCard(true);
            Expect.generatedAnswerContentContainsHTML('ul');
            Expect.generatedAnswerContentContainsHTML('li');
            Expect.generatedAnswerContentContainsText('list item 1');
            Expect.generatedAnswerContentContainsText('list item 2');
          });

          it('should properly render tables as scrollable-tables', () => {
            const genQaMarkdownTextPayload = {
              payloadType: 'genqa.messageType',
              payload: JSON.stringify({
                textDelta:
                  '| Tables | Are | Cool |\n|----------|-------------|------|\n| col1 | col2 | col3 |',
              }),
              finishReason: 'COMPLETED',
            };
            mockStreamResponse(streamId, [
              genQaMarkdownTypePayload,
              genQaMarkdownTextPayload,
            ]);
            visitGeneratedAnswer({
              useCase: param.useCase,
            });
            Expect.displayGeneratedAnswerCard(true);
            Expect.generatedAnswerContentContainsHTML(
              'div.scrollable-table > table > thead'
            );
            Expect.generatedAnswerContentContainsHTML('th');
            Expect.generatedAnswerContentContainsText('Tables Are Cool');
            Expect.generatedAnswerContentContainsText('col1 col2 col3');
          });

          it('should properly render code blocks', () => {
            const genQaMarkdownTextPayload = {
              payloadType: 'genqa.messageType',
              payload: JSON.stringify({
                textDelta: '```\nconst foo = "bar";\nconsole.log(foo);\n```',
              }),
              finishReason: 'COMPLETED',
            };
            mockStreamResponse(streamId, [
              genQaMarkdownTypePayload,
              genQaMarkdownTextPayload,
            ]);
            visitGeneratedAnswer({
              useCase: param.useCase,
            });
            Expect.displayGeneratedAnswerCard(true);
            Expect.generatedAnswerContentContainsHTML('pre > code');
            Expect.generatedAnswerContentContainsText('const foo = "bar";');
            Expect.generatedAnswerContentContainsText('console.log(foo);');
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
                    NextAnalyticsExpectations.emitQnaAnswerActionEvent(
                      {
                        action: 'like',
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
            describe.skip(
              'when providing detailed feedback',
              {
                retries: 5,
              },
              () => {
                const streamId = crypto.randomUUID();
                const responseId = crypto.randomUUID();

                const yesOption = 'yes';
                const unknownOption = 'unknown';
                const noOption = 'no';
                const exampleDetails = 'example details';
                const exampleDocumentUrl = 'https://www.foo.com/';

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
                  Expect.displayLikeButton(true);
                  Expect.displayDislikeButton(true);
                  Expect.likeButtonIsChecked(false);
                  Expect.dislikeButtonIsChecked(false);

                  scope('when disliking the generated answer', () => {
                    Actions.dislikeGeneratedAnswer();
                    if (analyticsMode === 'next') {
                      NextAnalyticsExpectations.emitQnaAnswerActionEvent(
                        {
                          action: 'dislike',
                          answer: {
                            responseId,
                            type: answerType,
                          },
                        },
                        exampleTrackingId
                      );
                    } else {
                      Expect.logDislikeGeneratedAnswer(streamId);
                    }
                  });

                  const feedbackQuestionsIndexes = {
                    correctTopic: 0,
                    hallucinationFree: 1,
                    documented: 2,
                    readable: 3,
                  };

                  scope('when submiting invalid feedback', () => {
                    Actions.clickFeedbackOption(
                      unknownOption,
                      feedbackQuestionsIndexes.correctTopic
                    );

                    Actions.clickFeedbackSubmitButton();
                    Expect.displaySuccessMessage(false);
                  });

                  scope('when submiting valid feedback', () => {
                    Actions.clickFeedbackOption(
                      unknownOption,
                      feedbackQuestionsIndexes.correctTopic
                    );
                    Actions.clickFeedbackOption(
                      yesOption,
                      feedbackQuestionsIndexes.hallucinationFree
                    );
                    Actions.clickFeedbackOption(
                      yesOption,
                      feedbackQuestionsIndexes.documented
                    );
                    Actions.clickFeedbackOption(
                      noOption,
                      feedbackQuestionsIndexes.readable
                    );
                    Actions.typeInFeedbackDocumentUrlInput(exampleDocumentUrl);
                    Actions.typeInFeedbackDetailsInput(exampleDetails);

                    Actions.clickFeedbackSubmitButton();
                    Expect.displaySuccessMessage(true);
                    if (analyticsMode === 'next') {
                      NextAnalyticsExpectations.emitQnaSubmitRgaFeedbackEvent(
                        {
                          feedback: {
                            helpful: false,
                            readable: noOption,
                            documented: yesOption,
                            details: exampleDetails,
                            hallucination_free: yesOption,
                            document_url: exampleDocumentUrl,
                          },
                          answer: {
                            responseId,
                          },
                        },
                        exampleTrackingId
                      );
                    } else {
                      Expect.logGeneratedAnswerFeedbackSubmit(streamId, {
                        helpful: false,
                        correctTopicValue: unknownOption,
                        hallucinationFree: yesOption,
                        documented: yesOption,
                        readable: noOption,
                        documentUrl: exampleDocumentUrl,
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
                    }
                  );
                });
              }
            );

            // TODO: SFINT-5538 - Completely toggle answer.
            describe.skip('the generated answer toggle button', () => {
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
                  useCase: param.useCase,
                  withToggle: true,
                });
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
                    // TODO: SFINT-5670 - New events for toggling the generated answer, or remove completely toggle answer.
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

            describe('the collapsible option', () => {
              const streamId = crypto.randomUUID();
              const responseId = crypto.randomUUID();

              beforeEach(() => {
                mockSearchWithGeneratedAnswer(
                  streamId,
                  param.useCase,
                  responseId
                );
                mockStreamResponse(streamId, genQaLongMessageTypePayload);
                visitGeneratedAnswer({
                  useCase: param.useCase,
                  collapsible: true,
                });
              });

              it('should display the toggle collapse button', () => {
                Expect.displayGeneratedAnswerCard(true);
                Expect.generatedAnswerCollapsed(true);
                Expect.displayGeneratedAnswerToggleCollapseButton(true);
                Expect.displayGeneratedAnswerGeneratingMessage(false);
                Expect.displayCitations(false);
                Expect.displayDisclaimer(true);

                scope('when clicking the show more button to expand', () => {
                  Actions.clickToggleCollapseButton();
                  Expect.generatedAnswerCollapsed(false);
                  Expect.generatedAnswerToggleCollapseButtonContains(
                    'Show less'
                  );
                  Expect.displayCitations(false);
                  Expect.displayDisclaimer(true);
                  if (analyticsMode === 'next') {
                    // TODO: SFINT-5670 - New events for generated answer to be updated.
                    // NextAnalyticsExpectations.emitQnaAnswerActionEvent(
                    //   {
                    //     answer: {
                    //       responseId,
                    //       type: answerType,
                    //     },
                    //     action: 'expand',
                    //   },
                    //   exampleTrackingId
                    // );
                  } else {
                    Expect.logGeneratedAnswerExpand(streamId);
                  }
                });

                scope(
                  'when clicking the show less button a second time to collapse',
                  () => {
                    Actions.clickToggleCollapseButton();
                    Expect.generatedAnswerCollapsed(true);
                    Expect.generatedAnswerToggleCollapseButtonContains(
                      'Show more'
                    );
                    Expect.displayCitations(false);
                    Expect.displayDisclaimer(true);
                    if (analyticsMode === 'next') {
                      // TODO: SFINT-5670 - New events for generated answer to be updated.
                      // NextAnalyticsExpectations.emitQnaAnswerActionEvent(
                      //   {
                      //     answer: {
                      //       responseId,
                      //       type: answerType,
                      //     },
                      //     action: 'collapse',
                      //   },
                      //   exampleTrackingId
                      // );
                    } else {
                      Expect.logGeneratedAnswerCollapse(streamId);
                    }
                  }
                );
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
                uri: 'https://www.coveo1.com',
                permanentid: 'some-permanent-id-1',
                clickUri: exampleLinkUrl,
                text: 'example text 1',
              };
              const secondTestCitation = {
                id: 'some-id-2',
                title: 'Some Title 2',
                uri: 'https://www.coveo2.com',
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

        describe('when #fieldsToIncludeInCitations attribute has a value', () => {
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
              Expect.searchQueryContainsCorrectFieldsToIncludeInCitations(
                customFields.split(',')
              );
            });
          });
        });

        describe('when #collapsible is set to true', () => {
          describe('when the generated answer is still streaming', () => {
            it('should properly display the generating answer message', () => {
              const streamId = crypto.randomUUID();

              const testMessagePayload = {
                payloadType: 'genqa.messageType',
                payload: JSON.stringify({
                  textDelta: testLongText,
                }),
              };

              mockSearchWithGeneratedAnswer(streamId, param.useCase);
              mockStreamResponse(streamId, testMessagePayload);
              visitGeneratedAnswer({
                collapsible: true,
                useCase: param.useCase,
              });

              scope('when loading the page', () => {
                Expect.displayGeneratedAnswerCard(true);
                Expect.generatedAnswerCollapsed(true);
                Expect.displayGeneratedAnswerToggleCollapseButton(false);
                Expect.displayGeneratedAnswerGeneratingMessage(true);
                Expect.displayCitations(false);
                Expect.displayDisclaimer(false);
              });
            });
          });

          describe('when the generated answer is done streaming', () => {
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
                Expect.displayDisclaimer(true);
              });

              scope('when clicking the show more button to expand', () => {
                Actions.clickToggleCollapseButton();
                Expect.generatedAnswerCollapsed(false);
                Expect.generatedAnswerToggleCollapseButtonContains('Show less');
                Expect.displayCitations(false);
                Expect.displayDisclaimer(true);
                if (analyticsMode === 'legacy') {
                  Expect.logGeneratedAnswerExpand(streamId);
                }
              });

              scope(
                'when clicking the show less button a second time to collapse',
                () => {
                  Actions.clickToggleCollapseButton();
                  Expect.generatedAnswerCollapsed(true);
                  Expect.generatedAnswerToggleCollapseButtonContains(
                    'Show more'
                  );
                  Expect.displayCitations(false);
                  Expect.displayDisclaimer(true);
                  if (analyticsMode === 'legacy') {
                    Expect.logGeneratedAnswerCollapse(streamId);
                  }
                }
              );
            });
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
              Expect.displayDisclaimer(true);
            });
          });
        });
      });
    });
  });
});
