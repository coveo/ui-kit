import {TabBarSelector, TabBarSelectors} from './tab-bar-selectors';

function tabBarActions(selector: TabBarSelector) {
  return {
    openDropdown: () => {
      selector.moreButton().click().logAction('When opening the dropdown list');
    },

    selectTab: (label: string) => {
      selector
        .allTabs()
        .contains(label)
        .click()
        .logAction(`When selecting the ${label} tab`);
    },

    selectTabFromDropdown: (label: string) => {
      selector
        .allDropdownOptions()
        .contains(label)
        .click()
        .logAction(`When selecting the ${label} tab from the dropdown list`);
    },

    clickContainer: () => {
      selector
        .get()
        .click()
        .logAction('When clicking on the container of the component');
    },
  };
}

export const TabBarActions = {
  ...tabBarActions(TabBarSelectors),
};
