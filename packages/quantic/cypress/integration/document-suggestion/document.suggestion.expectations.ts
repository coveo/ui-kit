import {InterceptAliases} from '../../page-objects/case-assist';
import {should} from '../common-selectors';
import {
  DocumentSuggestionSelector,
  DocumentSuggestionSelectors,
} from './document-suggestion-selectors';

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

    displayExcerpt: (display: boolean, idx: number) => {
      selector
        .documentExcerpt(idx)
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(
            display
          )} display the excerpt of the document at the index: ${idx}`
        );
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

    logClickingSuggestion: (index: number) => {
      cy.wait(InterceptAliases.UA.SuggestionClick)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          selector
            .accordionSection(index)
            .invoke('attr', 'data-id')
            .should('eq', analyticsBody.svc_action_data.suggestionId);
        })
        .logDetail('should log the "suggestion_click" UA event');
    },

    logRatingSuggestion: (index: number) => {
      cy.wait(InterceptAliases.UA.SuggestionRate)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          selector
            .accordionSection(index)
            .invoke('attr', 'data-id')
            .should('eq', analyticsBody.svc_action_data.suggestionId);
        })
        .logDetail('should log the "suggestion_rate" UA event');
    },
  };
}

export const DocumentSuggestionExpectations = {
  ...documentSuggestionExpectations(DocumentSuggestionSelectors),
};
