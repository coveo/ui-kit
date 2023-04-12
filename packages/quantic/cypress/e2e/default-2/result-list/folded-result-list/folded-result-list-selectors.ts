import {CypressSelector} from '../../../common-selectors';
import {ResultListSelector} from '../result-list-selectors';

export const resultlistComponent = 'c-quantic-folded-result-list';

export interface FoldedResultListSelector extends ResultListSelector {
  childResultsToggleButton: () => CypressSelector;
  resultLinksAtSpecificLevel: (level: number) => CypressSelector;
  noMoreChildrenMessage: () => CypressSelector;
}

export const FoldedResultListSelectors: FoldedResultListSelector = {
  get: () => cy.get(resultlistComponent),

  placeholder: () =>
    FoldedResultListSelectors.get().find('.placeholder__result-container'),
  results: () => FoldedResultListSelectors.get().find('c-quantic-result'),
  resultLinks: () =>
    FoldedResultListSelectors.get().find(
      'c-quantic-result c-quantic-result-link'
    ),
  resultLinksAtSpecificLevel: (level: number) =>
    FoldedResultListSelectors.get().find(
      `${new Array(level + 1)
        .fill('c-quantic-result')
        .join(' ')} c-quantic-result-link:not(${new Array(level + 2)
        .fill('c-quantic-result')
        .join(' ')} c-quantic-result-link)`
    ),
  childResultsToggleButton: () =>
    FoldedResultListSelectors.get().find(
      '[data-cy="result-children__toggle-button"]'
    ),
  noMoreChildrenMessage: () =>
    FoldedResultListSelectors.get().find(
      '[data-cy="result-children__no-more-children-message"]'
    ),
};
