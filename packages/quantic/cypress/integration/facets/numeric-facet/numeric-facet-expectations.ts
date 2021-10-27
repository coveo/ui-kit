import {InterceptAliases} from '../../../page-objects/search';
import {
  AllFacetSelectors,
  NumericFacetSelectors,
} from './numeric-facet-selectors';

const formatDefaultNumericFacetValue = (value: string) => {
  value = value.trim();
  const valueSeparator = 'to';
  const splitByValue = ` ${valueSeparator} `;
  const start = value.split(splitByValue)[0].replace(/,/g, '');
  const end = value.split(splitByValue)[1].replace(/,/g, '');
  return `${start}..${end}`;
};

const numericFacetExpectations = (selector: AllFacetSelectors) => {
  return {
    isRendered: (accessible: boolean) => {
      selector.get().should(accessible ? 'exist' : 'not.exist');
    },
    displayLabel: (display: boolean) => {
      selector.label().should(display ? 'exist' : 'not.exist');
    },
    displayClearFilterButton: (display: boolean) => {
      selector.clearFilterButton().should(display ? 'exist' : 'not.exist');
    },
    displaySearchForm: (display: boolean) => {
      selector.searchForm().should(display ? 'exist' : 'not.exist');
    },
    numberOfValues: (value: number) => {
      selector.values().should('have.length', value);
    },
    numberOfSelectedCheckboxValues: (value: number) => {
      if (value > 0) {
        selector.selectedCheckbox().should('have.length', value);
      }
      selector.selectedCheckbox().should('not.exist');
    },
    logNumericFacetLoad: () => {
      cy.wait(InterceptAliases.UA.Load).then((interception) => {
        const analyticsBody = interception.request.body;
        expect(analyticsBody).to.have.property('actionCause', 'interfaceLoad');
      });
    },
    logNumericFacetSelect: (field: string, index: number) => {
      cy.wait(InterceptAliases.UA.Load).then((interception) => {
        const analyticsBody = interception.request.body;
        expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
        expect(analyticsBody.customData).to.have.property('facetField', field);
        expect(analyticsBody.facetState[0]).to.have.property(
          'state',
          'selected'
        );
        expect(analyticsBody.facetState[0]).to.have.property('field', field);

        NumericFacetSelectors.facetValueLabelAtIndex(index)
          .invoke('text')
          .then((txt: string) => {
            expect(analyticsBody.customData).to.have.property(
              'facetValue',
              formatDefaultNumericFacetValue(txt)
            );
          });
      });
    },
  };
};
export const NumericFacetExpectations = {
  ...numericFacetExpectations(NumericFacetSelectors),
};
