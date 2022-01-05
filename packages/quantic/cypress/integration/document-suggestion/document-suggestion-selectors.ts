import {ComponentSelector, CypressSelector} from '../common-selectors';

export const documentSuggestionComponent = 'c-quantic-document-suggestion';

export interface DocumentSuggestionSelector extends ComponentSelector {
  accordion: () => CypressSelector;
  accordionSection: (idx: number) => CypressSelector;
}

export const DocumentSuggestionSelectors: DocumentSuggestionSelector = {
  get: () => cy.get(documentSuggestionComponent),

  accordion: () =>
    DocumentSuggestionSelectors.get().find('lightning-accordion'),
  accordionSection: (idx: number) =>
    DocumentSuggestionSelectors.get()
      .find('lightning-accordion-section')
      .eq(idx),
};
