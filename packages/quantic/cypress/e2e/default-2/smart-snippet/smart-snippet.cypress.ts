import {performSearch} from '../../../page-objects/actions/action-perform-search';
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
import {SmartSnippetActions as Actions} from './smart-snippet-actions';
import {SmartSnippetExpectations as Expect} from './smart-snippet-expectations';

interface smartSnippetOptions {
  useCase: string;
  maximumSnippetHeight: number;
}

const inactiveLink = 'javascript:void(0);';
const exampleSmartSnippetQuestion = 'Example smart snippet question';
const exampleSmartSnippetSourceUri = inactiveLink;
const exampleSmartSnippetSourceTitle = 'Example result title';
const examplePermanentId = '123';
const exampleInlineLinkText = 'Example inline link';
const exampleInlineLinkUrl =
  'https://saas-inspiration-5437-dev-ed.scratch.my.site.com/examples/s/';
const exampleSmartSnippetAnswer = `<div data-cy="smart-snippet__inline-link"><p>Example smart snippet answer</p><a href="${exampleInlineLinkUrl}">${exampleInlineLinkText}</a></div>`;
const exampleUriHash = 'exampleUriHash';
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
        },
        options.useCase
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

      describe('when the query returns a smart snippet', () => {
        describe('when the smart snippet answer is not collapsed', () => {
          it('should properly display the smart snippet', () => {
            visitPage({useCase: param.useCase});

            scope('when loading the page', () => {
              Expect.displaySmartSnippetCard(true);
              Expect.displaySmartSnippetQuestion(exampleSmartSnippetQuestion);
              Expect.displaySmartSnippetAnswer(exampleSmartSnippetAnswer);
              Expect.displaySmartSnippetSourceUri(exampleSmartSnippetSourceUri);
              Expect.displaySmartSnippetSourceTitle(
                exampleSmartSnippetSourceTitle
              );
              Expect.displayCollapsedSmartSnippetAnswer(false);
              Expect.displayExpandedSmartSnippetAnswer(false);
              Expect.displaySmartSnippetAnswerToggle(false);
            });

            scope('when the source title is clicked', () => {
              Actions.clickSmartSnippetSourceTitle();
              Expect.logOpenSmartSnippetSource({
                title: exampleSmartSnippetSourceTitle,
                uri: exampleSmartSnippetSourceUri,
                permanentId: examplePermanentId,
              });
            });

            scope('when the source uri is clicked', () => {
              visitPage({useCase: param.useCase});
              Actions.clickSmartSnippetSourceUri();
              Expect.logOpenSmartSnippetSource({
                title: exampleSmartSnippetSourceTitle,
                uri: exampleSmartSnippetSourceUri,
                permanentId: examplePermanentId,
              });
            });

            scope(
              'when an inlink within the smart snippet answer is clicked',
              () => {
                Actions.clickSmartSnippetInlineLink();
                Expect.logOpenSmartSnippetInlineLink({
                  title: exampleSmartSnippetSourceTitle,
                  uri: exampleSmartSnippetSourceUri,
                  permanentId: examplePermanentId,
                  linkUrl: exampleInlineLinkUrl,
                  linkText: exampleInlineLinkText,
                });
                visitPage({useCase: param.useCase});
              }
            );
          });
        });

        describe('when the smart snippet answer is collapsed', () => {
          it('should properly display the smart snippet', () => {
            visitPage({useCase: param.useCase, maximumSnippetHeight: 0}, false);

            scope('when loading the page', () => {
              Expect.displaySmartSnippetCard(true);
              Expect.displaySmartSnippetQuestion(exampleSmartSnippetQuestion);
              Expect.displaySmartSnippetSourceUri(exampleSmartSnippetSourceUri);
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
              Expect.logExpandSmartSnippet();
            });

            scope('when collapsing the smart snippet answer', () => {
              Actions.toggleSmartSnippetAnswer();
              Expect.displayCollapsedSmartSnippetAnswer(true);
              Expect.displayExpandedSmartSnippetAnswer(false);
              Expect.displaySmartSnippetShowMoreButton(true);
              Expect.logCollapseSmartSnippet();
            });
          });
        });

        // Disabling this test temporarily, will be fixed as part of : https://coveord.atlassian.net/browse/SFINT-5514
        describe.skip('when clicking the feedback like button', () => {
        // Disabling this test temporarily, will be fixed as part of : https://coveord.atlassian.net/browse/SFINT-5514
        describe.skip('when clicking the feedback like button', () => {
          it('should properly log the analytics', () => {
            visitPage({useCase: param.useCase});

            scope('when clicking the like button', () => {
              Expect.displaySmartSnippetCard(true);
              Actions.clickSmartSnippetLikeButton();
              Expect.logLikeSmartSnippet();
              Expect.displayExplainWhyButton(false);
            });
          });
        });

        // Disabling this test temporarily, will be fixed as part of : https://coveord.atlassian.net/browse/SFINT-5514
        describe.skip(
        // Disabling this test temporarily, will be fixed as part of : https://coveord.atlassian.net/browse/SFINT-5514
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
                Expect.logDislikeSmartSnippet();
                Expect.displayExplainWhyButton(true);
              });

              scope('when clicking the explain why button', () => {
                Actions.clickSmartSnippetExplainWhyButton();
                Expect.logOpenSmartSnippetFeedbackModal();
              });

              scope('when closing the feedback modal', () => {
                Actions.clickFeedbackCancelButton();
                Expect.logCloseSmartSnippetFeedbackModal();
              });

              scope('when selecting a feedback option', () => {
                const exampleDetails = 'example details';
                Actions.clickSmartSnippetExplainWhyButton();
                Expect.logOpenSmartSnippetFeedbackModal();
                Actions.clickFeedbackOption(
                  feedbackOptions.indexOf(otherOption)
                );
                Actions.typeInFeedbackDetailsInput(exampleDetails);
                Actions.clickFeedbackSubmitButton();
                Expect.logSendSmartSnippetReason({
                  reason: otherOption,
                  details: exampleDetails,
                });
                Actions.clickFeedbackDoneButton();
                Expect.logCloseSmartSnippetFeedbackModal();
              });
            });
          }
        );
      });
    });
  });
});
