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
