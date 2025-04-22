import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const didYouMeanComponent = 'c-quantic-did-you-mean';

export interface DidYouMeanSelector extends ComponentSelector {
  didYouMeanLabel: () => CypressSelector;
  noResultLabel: () => CypressSelector;
  automaticQueryCorrectionLabel: () => CypressSelector;
  applyCorrectionButton: () => CypressSelector;
  showingResultsForLabel: () => CypressSelector;
  searchInsteadForLabel: () => CypressSelector;
  undoButton: () => CypressSelector;
}

export const DidYouMeanSelectors: DidYouMeanSelector = {
  get: () => cy.get(didYouMeanComponent),

  didYouMeanLabel: () =>
    DidYouMeanSelectors.get().find('[data-testid="did-you-mean-label"]'),
  noResultLabel: () =>
    DidYouMeanSelectors.get().find('[data-testid="no-result-label"]'),
  automaticQueryCorrectionLabel: () =>
    DidYouMeanSelectors.get().find(
      '[data-testid="automatic-query-correction-label"]'
    ),
  applyCorrectionButton: () =>
    DidYouMeanSelectors.get().find('[data-testid="apply-correction-button"]'),
  showingResultsForLabel: () =>
    DidYouMeanSelectors.get().find('[data-testid="showing-results-for-label"]'),
  searchInsteadForLabel: () =>
    DidYouMeanSelectors.get().find('[data-testid="search-instead-for-label"]'),
  undoButton: () =>
    DidYouMeanSelectors.get().find('[data-testid="undo-button"]'),
};
