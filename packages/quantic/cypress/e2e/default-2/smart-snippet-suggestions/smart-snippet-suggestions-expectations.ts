import {InterceptAliases} from '../../../page-objects/search';
import {getAnalyticsBodyFromInterception} from '../../common-expectations';
import {should} from '../../common-selectors';
import {
  SmartSnippetSuggestionsSelector,
  SmartSnippetSuggestionsSelectors,
} from './smart-snippet-suggestions-selectors';

interface Suggestion {
  answerSnippet: string;
  question: string;
  documentId: {contentIdKey: string; contentIdValue: string};
  title?: string;
  uri?: string;
  position?: number;
  linkText?: string;
  linkUrl?: string;
}

function logSmartSnippetSuggestionsEvent(
  suggestion: Suggestion,
  eventName: string,
  eventType: 'click' | 'custom'
) {
  const {
    title,
    uri,
    position,
    documentId,
    question,
    answerSnippet,
    linkText,
    linkUrl,
  } = suggestion;
  cy.wait(eventName)
    .then((interception) => {
      const analyticsBody = getAnalyticsBodyFromInterception(interception);
      const customData = analyticsBody?.customData;
      const documentIdPayload = customData?.documentId;
      expect(customData).to.have.property('answerSnippet', answerSnippet);
      expect(customData).to.have.property('question', question);
      expect(documentIdPayload).to.have.property(
        'contentIdKey',
        documentId.contentIdKey
      );
      expect(documentIdPayload).to.have.property(
        'contentIdValue',
        documentId.contentIdValue
      );
      if (eventType === 'click') {
        expect(analyticsBody).to.have.property('documentTitle', title);
        expect(analyticsBody).to.have.property('documentUri', uri);
        expect(analyticsBody).to.have.property('documentUrl', uri);
        expect(analyticsBody).to.have.property('documentPosition', position);
        expect(customData).to.have.property(
          'contentIDKey',
          documentId.contentIdKey
        );
        expect(customData).to.have.property(
          'contentIDValue',
          documentId.contentIdValue
        );
      }
      if (linkText || linkUrl) {
        expect(customData).to.have.property('linkText', linkText);
        expect(customData).to.have.property('linkURL', linkUrl);
      }
    })
    .logDetail(`should log the ${eventName} UA event`);
}

function smartSnippetSuggestionsExpectations(
  selector: SmartSnippetSuggestionsSelector
) {
  return {
    displaySmartSnippetSuggestionsCard: (display: boolean) => {
      selector
        .smartSnippetSuggestionsCard()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the smart snippet suggestions`);
    },

    displaySmartSnippetSuggestionsQuestion: (index: number, value: string) => {
      selector
        .smartSnippetSuggestionHeading(index)
        .contains(value)
        .logDetail(
          `should display the correct question of the suggestion at the index ${index}`
        );
    },

    displaySmartSnippetSuggestionsAnswer: (
      index: number,
      answer: {text: string; link: {text: string; href: string}}
    ) => {
      selector
        .smartSnippetSuggestionsAnswer(index)
        .then((elem) => {
          const linkElement: HTMLAnchorElement | null = elem[0].querySelector(
            '[data-cy="answer-inline-link"]'
          );
          const textElement = elem[0].querySelector('[data-cy="answer-text"]');

          expect(textElement?.textContent).to.equal(answer.text);
          expect(linkElement?.target).to.equal('_blank');
          expect(linkElement?.textContent).to.equal(answer.link.text);
          expect(linkElement?.href).to.equal(answer.link.href);
        })
        .logDetail(
          `should display the correct answer of the suggestion at the index ${index}`
        );
    },

    displaySmartSnippetSuggestionsSourceUri: (index: number, value: string) => {
      selector
        .smartSnippetSuggestionsSourceUri(index)
        .contains(value)
        .logDetail(
          `should display the correct source uri of the suggestion at the index ${index}`
        );
    },

    displaySmartSnippetSuggestionsSourceTitle: (
      index: number,
      value: string
    ) => {
      selector
        .smartSnippetSuggestionsSourceTitle(index)
        .contains(value)
        .logDetail(
          `should display the correct source title of the suggestion at the index ${index}`
        );
    },

    logExpandSmartSnippetSuggestion: (suggestion: Suggestion) => {
      logSmartSnippetSuggestionsEvent(
        suggestion,
        InterceptAliases.UA.ExpandSmartSnippetSuggestion,
        'custom'
      );
    },

    logCollapseSmartSnippetSuggestion: (suggestion: Suggestion) => {
      logSmartSnippetSuggestionsEvent(
        suggestion,
        InterceptAliases.UA.CollapseSmartSnippetSuggestion,
        'custom'
      );
    },

    logOpenSmartSnippetSuggestionSource: (suggestion: Suggestion) => {
      logSmartSnippetSuggestionsEvent(
        suggestion,
        InterceptAliases.UA.OpenSmartSnippetSuggestionSource,
        'click'
      );
    },

    logOpenSmartSnippetSuggestionInlineLink: (suggestion: Suggestion) => {
      logSmartSnippetSuggestionsEvent(
        suggestion,
        InterceptAliases.UA.OpenSmartSnippetSuggestionInlineLink,
        'click'
      );
    },
  };
}

export const SmartSnippetSuggestionsExpectations = {
  ...smartSnippetSuggestionsExpectations(SmartSnippetSuggestionsSelectors),
};
