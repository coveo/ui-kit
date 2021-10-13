import {ConsoleExpectations} from '../console-expectations';
import {SortSelector, SortSelectors} from './sort-selectors';

function sortExpectations(selector: SortSelector) {
  return {
    displaySortDropdown: (display: boolean) => {
      selector.listbox().should(display ? 'exist' : 'not.exist');
    },

    containsOptions: (values: string[]) => {
      values.forEach((value) => {
        selector.option(value).should('exist');
      });
    },

    displayLocalizedLabel: (value: string, label: string) => {
      selector.option(value).should('contain', label);
    },
  };
}

export const SortExpectations = {
  ...sortExpectations(SortSelectors),
  console: {
    ...ConsoleExpectations,
  },
};
