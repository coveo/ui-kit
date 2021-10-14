import {InterceptAliases} from '../../page-objects/search';
import {SearchExpectations} from '../search-expectations';
import {SortSelector, SortSelectors} from './sort-selectors';

function sortExpectations(selector: SortSelector) {
  return {
    selectedOption: (value: string) => {
      selector
        .selectedOption()
        .invoke('attr', 'data-value')
        .should('contain', value);
    },

    displaySortDropdown: (display: boolean) => {
      selector.listbox().should(display ? 'exist' : 'not.exist');
    },

    containsOptions: (values: string[]) => {
      values.forEach((value) => {
        selector.option(value).should('exist');
      });
    },

    labelContains: (label: string) => {
      selector.label().should('contain', label);
    },

    optionsEqual: (options: {value: string; label: string}[]) => {
      options.forEach((option) => {
        selector.option(option.value).should('contain', option.label);
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
