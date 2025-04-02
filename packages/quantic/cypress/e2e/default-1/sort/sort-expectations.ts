import {Interception} from 'cypress/types/net-stubbing';
import {getQueryAlias, InterceptAliases} from '../../../page-objects/search';
import {useCaseEnum} from '../../../page-objects/use-case';
import {
  completeSearchRequest,
  ComponentErrorExpectations,
} from '../../common-expectations';
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

    sortOptionsEqual: (options: {value: string; label: string}[]) => {
      options.forEach((option) => {
        selector
          .sortOption(option.value)
          .should('exist')
          .should('contain', option.label)
          .logDetail(`${option} label should be equal to ${option.label}`);
      });
    },

    labelContains: (label: string) => {
      selector.label().should('contain', label);
    },

    sortCriteriaInSearchRequest: (
      body: Record<string, unknown>,
      value: string
    ) => {
      expect(body.sortCriteria).to.equal(value);
    },

    sortCriteriaInInitialSearchRequest: (
      value: string,
      useCase: useCaseEnum
    ) => {
      cy.get<Interception>(getQueryAlias(useCase))
        .then((interception) => {
          const body = interception.request.body;
          expect(body.sortCriteria).to.equal(value);
        })
        .logDetail(
          'should have the correct sort criteria in the search request'
        );
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
  ...ComponentErrorExpectations(SortSelectors),
  completeSearchRequest,
};
