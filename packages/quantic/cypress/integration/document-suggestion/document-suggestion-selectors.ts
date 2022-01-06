import {ComponentSelector, CypressSelector} from '../common-selectors';

export const documentSuggestionComponent = 'c-quantic-document-suggestion';

export interface DocumentSuggestionSelector extends ComponentSelector {
  accordion: () => CypressSelector;
  accordionSections: () => CypressSelector;
  accordionSection: (idx: number) => CypressSelector;
  sectionTitle: (idx: number) => CypressSelector;
  loadingSpinner: () => CypressSelector;
}

export const DocumentSuggestionSelectors: DocumentSuggestionSelector = {
  get: () => cy.get(documentSuggestionComponent),

  accordion: () =>
    DocumentSuggestionSelectors.get().find('lightning-accordion'),
  accordionSections: () =>
    DocumentSuggestionSelectors.get().find('lightning-accordion-section'),
  accordionSection: (idx: number) =>
    DocumentSuggestionSelectors.get()
      .find('lightning-accordion-section')
      .eq(idx),
  sectionTitle: (idx: number) =>
    DocumentSuggestionSelectors.get().find('.section-control').eq(idx),
  loadingSpinner: () =>
    DocumentSuggestionSelectors.get().find('lightning-spinner'),
};
