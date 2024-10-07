import {
  ComponentErrorSelector,
  ComponentSelector,
  CypressSelector,
} from '../../common-selectors';

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
}

export const DocumentSuggestionSelectors: DocumentSuggestionSelector &
  ComponentErrorSelector = {
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
      '[data-cy="quickview-modal__close-button"]'
    ),
  componentError: () =>
    DocumentSuggestionSelectors.get().find('c-quantic-component-error'),
  componentErrorMessage: () =>
    DocumentSuggestionSelectors.get().find(
      'c-quantic-component-error [data-cy="error-message"]'
    ),
};
