import {ComponentSelector, CypressSelector} from '../common-selectors';

export const pagerComponent = 'c-quantic-pager';

export interface PagerSelector extends ComponentSelector {
  previous: () => CypressSelector;
  next: () => CypressSelector;
  page: () => CypressSelector;
  selectedPage: () => CypressSelector;
}

export const PagerSelectors: PagerSelector = {
  get: () => cy.get(pagerComponent),

  previous: () => PagerSelectors.get().find('button[title="Previous"]'),
  next: () => PagerSelectors.get().find('button[title="Next"]'),
  page: () => PagerSelectors.get().find('c-quantic-number-button button'),
  selectedPage: () =>
    PagerSelectors.get().find(
      'c-quantic-number-button button.slds-button_brand'
    ),
};
