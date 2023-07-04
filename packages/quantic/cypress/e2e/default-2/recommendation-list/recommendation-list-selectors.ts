import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const recommendationlistComponent = 'c-quantic-recommendation-list';

export interface RecommendationListSelector extends ComponentSelector {
  placeholders: () => CypressSelector;
  recommendations: () => CypressSelector;
  label: (headingLevel: number) => CypressSelector;
  recommendationLinks: () => CypressSelector;
}

export const RecommendationListSelectors: RecommendationListSelector = {
  get: () => cy.get(recommendationlistComponent),

  placeholders: () =>
    RecommendationListSelectors.get().find(
      '[data-cy="recommendations__placeholder"]'
    ),
  recommendations: () =>
    RecommendationListSelectors.get().find('[data-cy="recommendations__item"]'),
  label: (headingLevel: number) =>
    RecommendationListSelectors.get().find(
      `[data-cy="recommendations__label"] h${headingLevel}`
    ),
  recommendationLinks: () =>
    RecommendationListSelectors.get().find(
      '[data-cy="recommendations__item"] c-quantic-result-link a'
    ),
};
