import {SortSelector, SortSelectors} from './sort-selectors';

function sortActions(selector: SortSelector) {
  return {
    openDropdown: () => {
      selector.combobox().click();
    },

    selectOption: (value: string) => {
      selector.combobox().click();
      selector.sortOption(value).click();
    },
  };
}

export const SortActions = {
  ...sortActions(SortSelectors),
};
