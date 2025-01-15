import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const tabBarComponent = 'c-quantic-tab-bar';
export const tabComponent = 'c-quantic-tab';

export interface TabBarSelector extends ComponentSelector {
  allTabs: () => CypressSelector;
  activeTab: () => CypressSelector;
  moreButton: () => CypressSelector;
  moreButtonLabel: () => CypressSelector;
  moreButtonIcon: () => CypressSelector;
  dropdownTrigger: () => CypressSelector;
  dropdown: () => CypressSelector;
  allDropdownOptions: () => CypressSelector;
  tabBarContainer: () => CypressSelector;
}

export const TabBarSelectors: TabBarSelector = {
  get: () => cy.get(tabBarComponent),

  allTabs: () => TabBarSelectors.get().find(tabComponent),
  activeTab: () =>
    TabBarSelectors.get().find('button.slds-tabs_default__item.slds-is-active'),
  moreButton: () =>
    TabBarSelectors.get().find('[data-testid="tab-bar_more-section"]'),
  moreButtonLabel: () =>
    TabBarSelectors.moreButton().find('button').first().invoke('text'),
  moreButtonIcon: () => TabBarSelectors.moreButton().find('lightning-icon'),
  dropdownTrigger: () => TabBarSelectors.get().find('.slds-dropdown-trigger'),
  dropdown: () => TabBarSelectors.get().find('.slds-dropdown'),
  allDropdownOptions: () =>
    TabBarSelectors.dropdownTrigger().find('.slds-dropdown__item'),
  tabBarContainer: () => TabBarSelectors.get().find('.tab-bar_container'),
};
