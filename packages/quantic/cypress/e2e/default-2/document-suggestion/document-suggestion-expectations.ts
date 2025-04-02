import {InterceptAliases} from '../../../page-objects/case-assist';
import {
  ComponentErrorExpectations,
  getAnalyticsBodyFromRequest,
} from '../../common-expectations';
import {should} from '../../common-selectors';
import {
  DocumentSuggestionSelector,
  DocumentSuggestionSelectors,
} from './document-suggestion-selectors';

interface Fields {
  uri: string;
}

const testOrigin = 'test origin';

function documentSuggestionExpectations(selector: DocumentSuggestionSelector) {
  return {
    displayAccordion: (display: boolean) => {
      selector
        .accordion()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the accordion`);
    },

    displayLoading: (display: boolean) => {
      selector
        .loadingSpinner()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the loading spinner`);
    },

    displayQuickviewButton: (display: boolean, idx: number) => {
      selector
        .quickviewButton(idx)
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(
            display
          )} display the quickview button of the document at the index: ${idx}`
        );
    },

    displayQuickviews: (display: boolean) => {
      selector
        .quickviews()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the quickview`);
    },

    displayAccordionSectionContent: (display: boolean, idx: number) => {
      selector
        .accordionSectionContent(idx)
        .should(display ? 'have.class' : 'not.have.class', 'slds-is-open')
        .logDetail(
          `${should(
            display
          )} display the content of the accordion section at the index: ${idx}`
        );
    },

    displayNoSuggestions: (display: boolean) => {
      selector
        .noSuggestionsMessage()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the no suggestions message`);
    },

    numberOfSuggestions: (value: number) => {
      selector
        .accordionSections()
        .should('have.length', value)
        .logDetail(`should display ${value} document suggestions`);
    },

    logDocumentSuggestionClick: (
      index: number,
      documents: Array<{title: string; fields: Fields}>
    ) => {
      cy.wait(InterceptAliases.UA.documentSuggestionClick)
        .then((interception) => {
          const analyticsBody = getAnalyticsBodyFromRequest(
            interception.request
          );
          selector
            .accordionSection(index)
            .invoke('attr', 'data-id')
            .should('eq', analyticsBody.customData.contentIDValue);
          expect(analyticsBody).to.have.property(
            'documentTitle',
            documents[index].title
          );
          expect(analyticsBody).to.have.property(
            'documentUri',
            documents[index].fields.uri
          );
          expect(analyticsBody).to.have.property('documentPosition', index + 1);
          expect(analyticsBody.originLevel1).to.eq(testOrigin);
        })
        .logDetail('should log the "documentSuggestionClick" UA event');
    },

    logDocumentSuggestionQuickview: (
      index: number,
      documents: Array<{title: string; fields: Fields}>
    ) => {
      cy.wait(InterceptAliases.UA.documentSuggestionQuickview)
        .then((interception) => {
          const analyticsBody = getAnalyticsBodyFromRequest(
            interception.request
          );
          selector
            .accordionSection(index)
            .invoke('attr', 'data-id')
            .should('eq', analyticsBody.customData.contentIDValue);
          expect(analyticsBody).to.have.property(
            'documentTitle',
            documents[index].title
          );
          expect(analyticsBody).to.have.property(
            'documentUri',
            documents[index].fields.uri
          );
          expect(analyticsBody).to.have.property('documentPosition', index + 1);
          expect(analyticsBody.originLevel1).to.eq(testOrigin);
        })
        .logDetail('should log the "documentSuggestionQuickview UA event');
    },

    logRatingSuggestion: (
      index: number,
      documents: Array<{title: string; fields: Fields}>
    ) => {
      cy.wait(InterceptAliases.UA.SuggestionRate)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          selector
            .accordionSection(index)
            .invoke('attr', 'data-id')
            .should('eq', analyticsBody.svc_action_data.suggestionId);
          expect(analyticsBody.svc_action_data.suggestion).to.have.property(
            'documentTitle',
            documents[index].title
          );
          expect(analyticsBody.svc_action_data.suggestion).to.have.property(
            'documentUri',
            documents[index].fields.uri
          );
          expect(analyticsBody.svc_action_data.suggestion).to.have.property(
            'documentPosition',
            index + 1
          );
          expect(analyticsBody.searchHub).to.eq(testOrigin);
        })
        .logDetail('should log the "suggestion_rate" UA event');
    },
  };
}

export const DocumentSuggestionExpectations = {
  ...documentSuggestionExpectations(DocumentSuggestionSelectors),
  ...ComponentErrorExpectations(DocumentSuggestionSelectors),
};
