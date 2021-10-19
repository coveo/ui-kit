import {ComponentSelector, CypressSelector} from '../common-selectors';

export const tabComponent = 'c-quantic-tab';

export interface TabSelector extends ComponentSelector {
  tab: () => CypressSelector;
  active: () => CypressSelector;
}

export const TabSelectors: TabSelector = {
  get: () => cy.get(tabComponent),

  tab: () => TabSelectors.get().find('li.slds-tabs_default__item'),
  active: () =>
    TabSelectors.get().find(
      'li.slds-tabs_default__item.slds-is-active a[role="tab"]'
    ),
};
