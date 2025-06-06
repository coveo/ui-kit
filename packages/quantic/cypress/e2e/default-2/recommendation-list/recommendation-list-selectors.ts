import {
  ComponentErrorSelector,
  ComponentSelector,
  CypressSelector,
} from '../../common-selectors';

export const recommendationlistComponent = 'c-quantic-recommendation-list';

export interface RecommendationListSelector extends ComponentSelector {
  placeholders: () => CypressSelector;
  recommendations: () => CypressSelector;
  label: (headingLevel: number) => CypressSelector;
  recommendationLinks: () => CypressSelector;
  carousel: () => CypressSelector;
}

export const RecommendationListSelectors: RecommendationListSelector &
  ComponentErrorSelector = {
  get: () => cy.get(recommendationlistComponent),

  placeholders: () =>
    RecommendationListSelectors.get().find(
      '[data-testid="recommendations__placeholder"]'
    ),
  recommendations: () =>
    RecommendationListSelectors.get().find(
      '[data-testid="recommendations__item"]'
    ),
  label: (headingLevel: number) =>
    RecommendationListSelectors.get().find(
      `[data-testid="recommendations__label"] h${headingLevel}`
    ),
  recommendationLinks: () =>
    RecommendationListSelectors.get().find(
      '[data-testid="recommendations__item"] [data-testid="result-link"] a'
    ),
  carousel: () =>
    RecommendationListSelectors.get().find(
      '[data-testid="recommendations__carousel"]'
    ),
  componentError: () =>
    RecommendationListSelectors.get().find('c-quantic-component-error'),
  componentErrorMessage: () =>
    RecommendationListSelectors.get().find(
      'c-quantic-component-error [data-cy="error-message"]'
    ),
};
