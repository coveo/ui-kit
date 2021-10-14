import {InterceptAliases} from '../../page-objects/search';
import {SearchExpectations} from '../search-expectations';
import {SortSelector, SortSelectors} from './sort-selectors';

function sortExpectations(selector: SortSelector) {
  return {
    selectedOption: (value: string, selected: boolean) => {
      selector.selectedOption(value).should(selected ? 'exist' : 'not.exist');
    },

    displaySortDropdown: (display: boolean) => {
      selector.listbox().should(display ? 'exist' : 'not.exist');
    },

    containsOptions: (values: string[]) => {
      values.forEach((value) => {
        selector.option(value).should('exist');
      });
    },

    displayLocalizedLabel: (label: string) => {
      selector.label().should('contain', label);
    },

    displayLocalizedOptionLabels: (values: string[], labels: string[]) => {
      values.forEach((value, index) => {
        selector.option(value).should('contain', labels[index]);
      });
    },

    logSortResults: (value: string) => {
      cy.wait(InterceptAliases.UA.Sort.SortResults).then((interception) => {
        const analyticsBody = interception.request.body;
        expect(analyticsBody).to.have.property('actionCause', 'resultsSort');

        const customData = analyticsBody.customData;
        expect(customData).to.have.property('resultsSortBy', value);
      });
    },
  };
}

export const SortExpectations = {
  ...sortExpectations(SortSelectors),
  search: {
    ...SearchExpectations,
  },
};
