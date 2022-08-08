import {ComponentSelector, CypressSelector} from '../common-selectors';

export const tabBarComponent = 'c-quantic-tab-bar';
export const tabComponent = 'c-quantic-tab';

export interface TabBarSelector extends ComponentSelector {
  allTabs: () => CypressSelector;
  activeTab: () => CypressSelector;
  moreButton: () => CypressSelector;
  moreButtonLabel: () => CypressSelector;
  moreButtonIcon: () => CypressSelector;
  dropdown: () => CypressSelector;
  allDropdownOptions: () => CypressSelector;
}

export const TabBarSelectors: TabBarSelector = {
  get: () => cy.get(tabBarComponent),

  allTabs: () => TabBarSelectors.get().find(tabComponent),
  activeTab: () =>
    TabBarSelectors.get().find('button.slds-tabs_default__item.slds-is-active'),
  moreButton: () => TabBarSelectors.get().find('.tab-bar_more-button'),
  moreButtonLabel: () =>
    TabBarSelectors.moreButton().find('button').invoke('text'),
  moreButtonIcon: () => TabBarSelectors.moreButton().find('lightning-icon'),
  dropdown: () => TabBarSelectors.get().find('.slds-dropdown-trigger'),
  allDropdownOptions: () =>
    TabBarSelectors.dropdown().find('.slds-dropdown__item'),
};
