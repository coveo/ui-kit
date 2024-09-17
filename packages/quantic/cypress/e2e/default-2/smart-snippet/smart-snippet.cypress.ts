import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {analyticsModeTest} from '../../../page-objects/analytics';
import {configure} from '../../../page-objects/configurator';
import {
  interceptSearch,
  mockSearchWithSmartSnippet,
  mockSearchWithoutSmartSnippet,
} from '../../../page-objects/search';
import {
  useCaseEnum,
  useCaseParamTest,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {scope} from '../../../reporters/detailed-collector';
import {setCookieToEnableNextAnalytics} from '../../../utils/analytics-utils';
import {NextAnalyticsExpectations} from '../../next-analytics-expectations';
import {SmartSnippetActions as Actions} from './smart-snippet-actions';
import {SmartSnippetExpectations as Expect} from './smart-snippet-expectations';

interface smartSnippetOptions {
  useCase: string;
  maximumSnippetHeight: number;
}

let analyticsMode: 'legacy' | 'next' = 'legacy';
const exampleTrackingId = 'tracking_id_123';
const answerType = 'SmartSnippet';
const exampleResponseId = 'example response id';

const exampleSmartSnippetQuestion = 'Example smart snippet question';
const exampleSmartSnippetSourceUri = '#';
const exampleSmartSnippetSourceTitle = 'Example result title';
const examplePermanentId = '123';
const exampleInlineLinkText = 'Example inline link';
const exampleInlineLinkUrl = '#';
const exampleAnswerText = 'Example smart snippet answer';
const exampleSmartSnippetAnswer = `<div data-cy="smart-snippet__inline-link"><p data-cy="answer-text">${exampleAnswerText}</p><a data-cy="answer-inline-link" href="${exampleInlineLinkUrl}">${exampleInlineLinkText}</a></div>`;
const exampleUriHash = 'exampleUriHash';
const exampleAuthor = 'example author';
const otherOption = 'other';
const feedbackOptions = [
  'does_not_answer',
  'partially_answers',
  'was_not_a_question',
  otherOption,
];

describe('quantic-smart-snippet', {browser: 'chrome'}, () => {
  const pageUrl = 's/quantic-smart-snippet';

  function visitPage(
    options: Partial<smartSnippetOptions> = {},
    withoutSmartSnippet = false
  ) {
    if (analyticsMode === 'next') {
      setCookieToEnableNextAnalytics(exampleTrackingId);
    }
    interceptSearch();
    if (withoutSmartSnippet) {
      mockSearchWithoutSmartSnippet(options.useCase);
    } else {
      mockSearchWithSmartSnippet(
        {
          question: exampleSmartSnippetQuestion,
          answer: exampleSmartSnippetAnswer,
          title: exampleSmartSnippetSourceTitle,
          uri: exampleSmartSnippetSourceUri,
          permanentId: examplePermanentId,
          uriHash: exampleUriHash,
          author: exampleAuthor,
        },
        options.useCase,
        exampleResponseId
      );
    }
    cy.visit(pageUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      describe('when the query does not return a smart snippet', () => {
        it('should not display the smart snippet', () => {
          visitPage({useCase: param.useCase}, true);

          scope('when loading the page', () => {
            Expect.displaySmartSnippetCard(false);
          });
        });
      });
      analyticsModeTest.forEach((analytics) => {
        describe(analytics.label, () => {
          before(() => {
            analyticsMode = analytics.mode;
          });

          describe('when the query returns a smart snippet', () => {
            describe('when the smart snippet answer is not collapsed', () => {
              it('should properly display the smart snippet', () => {
                visitPage({useCase: param.useCase});

                scope('when loading the page', () => {
                  Expect.displaySmartSnippetCard(true);
                  Expect.displaySmartSnippetQuestion(
                    exampleSmartSnippetQuestion
                  );
                  Expect.displaySmartSnippetAnswer({
                    text: exampleAnswerText,
                    link: {
                      text: exampleInlineLinkText,
                      href: `${location.origin}/examples/${pageUrl}#`,
                    },
                  });
                  Expect.displaySmartSnippetSourceUri(
                    exampleSmartSnippetSourceUri
                  );
                  Expect.displaySmartSnippetSourceTitle(
                    exampleSmartSnippetSourceTitle
                  );
                  Expect.displayCollapsedSmartSnippetAnswer(false);
                  Expect.displayExpandedSmartSnippetAnswer(false);
                  Expect.displaySmartSnippetAnswerToggle(false);
                });

                scope('when the source title is clicked', () => {
                  Actions.clickSmartSnippetSourceTitle();
                  if (analyticsMode === 'next') {
                    // TODO: SFINT-5670 - Fix the Next Analytics expectations following schema changes
                    // NextAnalyticsExpectations.emitQnaCitationClick(
                    //   {
                    //     answer: {
                    //       responseId: exampleResponseId,
                    //       type: answerType,
                    //     },
                    //     citation: {
                    //       id: examplePermanentId,
                    //       type: 'Source',
                    //     },
                    //   },
                    //   exampleTrackingId
                    // );
                  } else {
                    Expect.logOpenSmartSnippetSource({
                      title: exampleSmartSnippetSourceTitle,
                      uri: exampleSmartSnippetSourceUri,
                      permanentId: examplePermanentId,
                    });
                  }
                });

                scope('when the source uri is clicked', () => {
                  visitPage({useCase: param.useCase});
                  Actions.clickSmartSnippetSourceUri();
                  if (analyticsMode === 'next') {
                    // TODO: SFINT-5670 - Fix the Next Analytics expectations following schema changes
                    // NextAnalyticsExpectations.emitQnaCitationClick(
                    //   {
                    //     answer: {
                    //       responseId: exampleResponseId,
                    //       type: answerType,
                    //     },
                    //     citation: {
                    //       id: examplePermanentId,
                    //       type: 'Source',
                    //     },
                    //   },
                    //   exampleTrackingId
                    // );
                  } else {
                    Expect.logOpenSmartSnippetSource({
                      title: exampleSmartSnippetSourceTitle,
                      uri: exampleSmartSnippetSourceUri,
                      permanentId: examplePermanentId,
                    });
                  }
                });

                scope(
                  'when an inlink within the smart snippet answer is clicked',
                  () => {
                    visitPage({useCase: param.useCase});

                    Actions.clickSmartSnippetInlineLink();

                    if (analyticsMode === 'next') {
                      NextAnalyticsExpectations.emitQnaCitationClick(
                        {
                          answer: {
                            responseId: exampleResponseId,
                            type: answerType,
                          },
                          citation: {
                            id: examplePermanentId,
                            type: 'InlineLink',
                          },
                        },
                        exampleTrackingId
                      );
                    } else {
                      Expect.logOpenSmartSnippetInlineLink({
                        title: exampleSmartSnippetSourceTitle,
                        uri: exampleSmartSnippetSourceUri,
                        permanentId: examplePermanentId,
                        linkUrl: `${location.origin}/examples/${pageUrl}${exampleInlineLinkUrl}`,
                        linkText: exampleInlineLinkText,
                      });
                    }
                  }
                );
              });
            });

            describe('when the smart snippet answer is collapsed', () => {
              it('should properly display the smart snippet', () => {
                visitPage(
                  {useCase: param.useCase, maximumSnippetHeight: 0},
                  false
                );

                scope('when loading the page', () => {
                  Expect.displaySmartSnippetCard(true);
                  Expect.displaySmartSnippetQuestion(
                    exampleSmartSnippetQuestion
                  );
                  Expect.displaySmartSnippetSourceUri(
                    exampleSmartSnippetSourceUri
                  );
                  Expect.displaySmartSnippetSourceTitle(
                    exampleSmartSnippetSourceTitle
                  );
                  Expect.displayCollapsedSmartSnippetAnswer(true);
                  Expect.displayExpandedSmartSnippetAnswer(false);
                  Expect.displaySmartSnippetShowMoreButton(true);
                });

                scope('when expanding the smart snippet answer', () => {
                  Actions.toggleSmartSnippetAnswer();
                  Expect.displayCollapsedSmartSnippetAnswer(false);
                  Expect.displayExpandedSmartSnippetAnswer(true);
                  Expect.displaySmartSnippetShowLessButton(true);
                  if (analyticsMode === 'next') {
                    // TODO: SFINT-5670 - Fix the Next Analytics expectations following schema changes
                    // NextAnalyticsExpectations.emitQnaAnswerActionEvent(
                    //   {
                    //     answer: {
                    //       responseId: exampleResponseId,
                    //       type: answerType,
                    //     },
                    //     action: 'expand',
                    //   },
                    //   exampleTrackingId
                    // );
                  } else {
                    Expect.logExpandSmartSnippet();
                  }
                });

                scope('when collapsing the smart snippet answer', () => {
                  Actions.toggleSmartSnippetAnswer();
                  Expect.displayCollapsedSmartSnippetAnswer(true);
                  Expect.displayExpandedSmartSnippetAnswer(false);
                  Expect.displaySmartSnippetShowMoreButton(true);
                  if (analyticsMode === 'next') {
                    // TODO: SFINT-5670 - Fix the Next Analytics expectations following schema changes
                    // NextAnalyticsExpectations.emitQnaAnswerActionEvent(
                    //   {
                    //     answer: {
                    //       responseId: exampleResponseId,
                    //       type: answerType,
                    //     },
                    //     action: 'collapse',
                    //   },
                    //   exampleTrackingId
                    // );
                  } else {
                    Expect.logCollapseSmartSnippet();
                  }
                });
              });
            });
            // Skipping temporarily will be fixed in SFINT-5514
            describe.skip('when clicking the feedback like button', () => {
              it('should properly log the analytics', () => {
                visitPage({useCase: param.useCase});

                scope('when clicking the like button', () => {
                  Expect.displaySmartSnippetCard(true);
                  Actions.clickSmartSnippetLikeButton();
                  if (analyticsMode === 'next') {
                    NextAnalyticsExpectations.emitQnaLikeEvent(
                      {
                        feedback: {
                          liked: true,
                        },
                        answer: {
                          responseId: exampleResponseId,
                          type: answerType,
                        },
                      },
                      exampleTrackingId
                    );
                  } else {
                    Expect.logLikeSmartSnippet();
                  }
                  Expect.displayExplainWhyButton(false);
                });
              });
            });
            // Skipping temporarily will be fixed in SFINT-5514
            describe.skip(
              'when clicking the feedback dislike button',
              {
                retries: 20,
              },
              () => {
                it('should properly log the analytics', () => {
                  visitPage({useCase: param.useCase});

                  scope('when clicking the dislike button', () => {
                    Expect.displaySmartSnippetCard(true);
                    Actions.clickSmartSnippetDislikeButton();
                    if (analyticsMode === 'next') {
                      NextAnalyticsExpectations.emitQnaDislikeEvent(
                        {
                          feedback: {
                            liked: false,
                          },
                          answer: {
                            responseId: exampleResponseId,
                            type: answerType,
                          },
                        },
                        exampleTrackingId
                      );
                    } else {
                      Expect.logDislikeSmartSnippet();
                    }
                    Expect.displayExplainWhyButton(true);
                  });

                  scope('when clicking the explain why button', () => {
                    Actions.clickSmartSnippetExplainWhyButton();
                    if (analyticsMode === 'legacy') {
                      Expect.logOpenSmartSnippetFeedbackModal();
                    }
                  });

                  scope('when closing the feedback modal', () => {
                    Actions.clickFeedbackCancelButton();
                    if (analyticsMode === 'legacy') {
                      Expect.logCloseSmartSnippetFeedbackModal();
                    }
                  });

                  scope('when selecting a feedback option', () => {
                    const exampleDetails = 'example details';
                    Actions.clickSmartSnippetExplainWhyButton();
                    if (analyticsMode === 'legacy') {
                      Expect.logOpenSmartSnippetFeedbackModal();
                    }
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
                            responseId: exampleResponseId,
                            type: answerType,
                          },
                        },
                        exampleTrackingId
                      );
                    } else {
                      Expect.logSendSmartSnippetReason({
                        reason: otherOption,
                        details: exampleDetails,
                      });
                    }

                    Actions.clickFeedbackDoneButton();
                    if (analyticsMode === 'legacy') {
                      Expect.logCloseSmartSnippetFeedbackModal();
                    }
                  });

                  scope(
                    'when trying to open the feedback modal after executing the same query',
                    () => {
                      performSearch();
                      Expect.displayExplainWhyButton(false);
                      Expect.displaySmartSnippetCard(true);
                      Actions.clickSmartSnippetDislikeButton();
                      Expect.displayExplainWhyButton(false);
                    }
                  );

                  scope(
                    'when trying to open the feedback modal after executing a query that gave a new answer',
                    () => {
                      const exampleNewQuestion = 'new example question';
                      const exampleNewAnswer = 'new example answer';

                      mockSearchWithSmartSnippet(
                        {
                          question: exampleNewQuestion,
                          answer: exampleNewAnswer,
                          title: exampleSmartSnippetSourceTitle,
                          uri: exampleSmartSnippetSourceUri,
                          permanentId: '456',
                          uriHash: exampleUriHash,
                          author: exampleAuthor,
                        },
                        param.useCase,
                        exampleResponseId
                      );
                      performSearch();

                      Expect.displayExplainWhyButton(false);
                      Expect.displaySmartSnippetCard(true);
                      Expect.displaySmartSnippetQuestion(exampleNewQuestion);
                      Actions.clickSmartSnippetDislikeButton();
                      if (analyticsMode === 'next') {
                        NextAnalyticsExpectations.emitQnaDislikeEvent(
                          {
                            feedback: {
                              liked: false,
                            },
                            answer: {
                              type: answerType,
                            },
                          },
                          exampleTrackingId
                        );
                      } else {
                        Expect.logDislikeSmartSnippet();
                      }
                      Expect.displayExplainWhyButton(true);
                    }
                  );
                });
              }
            );
          });
        });
      });
    });
  });
});
