import {SortSelector, SortSelectors} from './sort-selectors';

function sortActions(selector: SortSelector) {
  return {
    selectOption: (value: string) => selector.listbox().select(value),
  };
}

export const SortActions = {
  ...sortActions(SortSelectors),
};
