import {ComponentSelector, CypressSelector} from '../common-selectors';

export const placeholderComponent = 'c-quantic-placeholder';

export interface PlaceholderSelector extends ComponentSelector {
  resultListPlaceholder: () => CypressSelector;
  resultPlaceholder: () => CypressSelector;
  cardPlaceholder: () => CypressSelector;
  cardRowPlaceholder: () => CypressSelector;
}

export const PlaceholderSelectors: PlaceholderSelector = {
  get: () => cy.get(placeholderComponent),

  resultListPlaceholder: () =>
    PlaceholderSelectors.get().find('.placeholder__result-container'),
  resultPlaceholder: () =>
    PlaceholderSelectors.get().find('.placeholder__result-row'),
  cardPlaceholder: () =>
    PlaceholderSelectors.get().find('.placeholder__card-container'),
  cardRowPlaceholder: () =>
    PlaceholderSelectors.get().find('.placeholder__card-row'),
};
