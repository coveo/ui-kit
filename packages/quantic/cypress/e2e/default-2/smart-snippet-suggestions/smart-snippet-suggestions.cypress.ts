import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {
  interceptSearch,
  mockSearchWithSmartSnippetSuggestions,
  mockSearchWithoutSmartSnippetSuggestions,
} from '../../../page-objects/search';
import {
  useCaseEnum,
  useCaseParamTest,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {scope} from '../../../reporters/detailed-collector';
import {stubConsoleError} from '../../console-selectors';
import {SmartSnippetSuggestionsActions as Actions} from './smart-snippet-suggestions-actions';
import {SmartSnippetSuggestionsExpectations as Expect} from './smart-snippet-suggestions-expectations';

const inactiveLink = 'javascript:void(0);';
const exampleInlineLink = 'https://www.coveo.com/en';
const exampleInlineLinkText = 'Example inline link';
const exampleAnswerText = 'Example smart snippet answer';
const exampleSmartSnippetAnswer = `<div data-cy="smart-snippet__inline-link"><p data-cy="answer-text">${exampleAnswerText}</p><a data-cy="answer-inline-link" href="${exampleInlineLink}">${exampleInlineLinkText}</a></div>`;
const exampleUriHash = 'exampleUriHash';
const exampleRelatedQuestions = [
  {
    question: 'first example question',
    answerSnippet: exampleSmartSnippetAnswer,
    title: 'first example title',
    uri: inactiveLink,
    uriHash: exampleUriHash,
    documentId: {
      contentIdKey: 'permanentid',
      contentIdValue: '123',
    },
  },
  {
    question: 'second example question',
    answerSnippet: exampleSmartSnippetAnswer,
    title: 'second example title',
    uri: inactiveLink,
    uriHash: exampleUriHash,
    documentId: {
      contentIdKey: 'permanentid',
      contentIdValue: '456',
    },
  },
];

interface SmartSnippetSuggestionsOptions {
  useCase: string;
}

describe('quantic-smart-snippet-suggestions', () => {
  const pageUrl = 's/quantic-smart-snippet-suggestions';

  function visitPage(
    options: Partial<SmartSnippetSuggestionsOptions>,
    withoutSmartSnippet = false
  ) {
    interceptSearch();
    if (withoutSmartSnippet) {
      mockSearchWithoutSmartSnippetSuggestions(options.useCase);
    } else {
      mockSearchWithSmartSnippetSuggestions(
        exampleRelatedQuestions,
        options.useCase
      );
    }
    cy.visit(pageUrl, {
      onBeforeLoad(win) {
        stubConsoleError(win);
      },
    });
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      describe('when the query does not return any smart snippet suggestions', () => {
        it('should not display the smart snippet suggestions', () => {
          visitPage({useCase: param.useCase}, true);

          scope('when loading the page', () => {
            Expect.displaySmartSnippetSuggestionsCard(false);
          });
        });
      });

      describe('when the query returns smart snippet suggestions', () => {
        it('should properly display the smart snippet suggestions', () => {
          visitPage({useCase: param.useCase});

          scope('when loading the page', () => {
            Expect.displaySmartSnippetSuggestionsCard(true);
            exampleRelatedQuestions.forEach((suggestion, index) => {
              Actions.toggleSuggestion(index);
              Expect.logExpandSmartSnippetSuggestion({
                answerSnippet: suggestion.answerSnippet,
                question: suggestion.question,
                documentId: suggestion.documentId,
              });
              Expect.displaySmartSnippetSuggestionsQuestion(
                index,
                suggestion.question
              );
              Expect.displaySmartSnippetSuggestionsAnswer(index, {
                text: exampleAnswerText,
                link: {
                  href: exampleInlineLink,
                  text: exampleInlineLinkText,
                },
              });
              Expect.displaySmartSnippetSuggestionsSourceUri(
                index,
                suggestion.uri
              );
              Expect.displaySmartSnippetSuggestionsSourceTitle(
                index,
                suggestion.title
              );
              Actions.toggleSuggestion(index);
              Expect.logCollapseSmartSnippetSuggestion({
                answerSnippet: suggestion.answerSnippet,
                question: suggestion.question,
                documentId: suggestion.documentId,
              });
            });
          });

          scope(
            'when the source title of one of the suggestions is clicked',
            () => {
              const index = 0;
              Actions.toggleSuggestion(index);
              Actions.clickSmartSnippetSuggestionsSourceTitle(index);
              Expect.logOpenSmartSnippetSuggestionSource({
                ...exampleRelatedQuestions[index],
                position: index + 1,
              });
            }
          );

          scope(
            'when the source uri of one of the suggestions is clicked',
            () => {
              const index = 0;
              visitPage({useCase: param.useCase});
              Actions.toggleSuggestion(index);
              Actions.clickSmartSnippetSuggestionsSourceUri(index);
              Expect.logOpenSmartSnippetSuggestionSource({
                ...exampleRelatedQuestions[index],
                position: index + 1,
              });
            }
          );

          scope(
            'when an inline link of one of the suggestions is clicked',
            () => {
              const index = 0;
              Actions.clickSmartSnippetSuggestionsInlineLink(index);
              Expect.logOpenSmartSnippetSuggestionInlineLink({
                ...exampleRelatedQuestions[index],
                position: index + 1,
                linkUrl: exampleInlineLink,
                linkText: exampleInlineLinkText,
              });
              visitPage({useCase: param.useCase});
            }
          );
        });
      });
    });
  });
});
