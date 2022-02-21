import {ComponentSelector, CypressSelector} from '../common-selectors';

export const documentSuggestionComponent = 'c-quantic-document-suggestion';

export interface DocumentSuggestionSelector extends ComponentSelector {
  accordion: () => CypressSelector;
  accordionSections: () => CypressSelector;
  accordionSection: (idx: number) => CypressSelector;
  accordionSectionContent: (idx: number) => CypressSelector;
  sectionTitle: (idx: number) => CypressSelector;
  loadingSpinner: () => CypressSelector;
  noSuggestionsMessage: () => CypressSelector;
  quickviewButton: (idx: number) => CypressSelector;
  quickviews: () => CypressSelector;
  quickviewCloseButton: () => CypressSelector;
  renderingError: () => CypressSelector;
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
  accordionSectionContent: (idx: number) =>
    DocumentSuggestionSelectors.get()
      .find('lightning-accordion-section section')
      .eq(idx),
  sectionTitle: (idx: number) =>
    DocumentSuggestionSelectors.get().find('.section-control').eq(idx),
  loadingSpinner: () =>
    DocumentSuggestionSelectors.get().find('lightning-spinner'),
  noSuggestionsMessage: () =>
    DocumentSuggestionSelectors.get().find('.no-suggestion-message'),
  quickviewButton: (idx: number) =>
    DocumentSuggestionSelectors.get()
      .find('c-quantic-result-quickview button')
      .eq(idx),
  quickviews: () =>
    DocumentSuggestionSelectors.get().find('c-quantic-result-quickview'),
  quickviewCloseButton: () =>
    DocumentSuggestionSelectors.get().find(
      'c-quantic-result-quickview section header button'
    ),
  renderingError: () =>
    DocumentSuggestionSelectors.get().find('.error-message'),
};
