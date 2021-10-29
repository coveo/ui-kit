import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {baseFacetExpectations} from '../facet-common-expectations';
import {field} from './numeric-facet-actions';
import {
  AllFacetSelectors,
  NumericFacetSelectors,
} from './numeric-facet-selectors';

const formatDefaultNumericFacetValue = (value: string) => {
  value = value.trim();
  const valueSeparator = '-';
  const splitByValue = ` ${valueSeparator} `;
  const start = value.split(splitByValue)[0].replace(/,/g, '');
  const end = value.split(splitByValue)[1].replace(/,/g, '');
  return `${start}..${end}`;
};

const numericFacetExpectations = (selector: AllFacetSelectors) => {
  return {
    isRendered: (accessible: boolean) => {
      selector
        .get()
        .should(accessible ? 'exist' : 'not.exist')
        .logDetail(
          `${should(accessible)} display the 'Numeric Facet' component`
        );
    },
    displayLabel: (display: boolean) => {
      selector
        .label()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the 'Label'`);
    },
    displayClearFilterButton: (display: boolean) => {
      selector
        .clearFilterButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the 'Clear filter' button`);
    },
    displaySearchForm: (display: boolean) => {
      selector
        .searchForm()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the 'Manual range' form`);
    },
    numberOfValues: (value: number) => {
      selector
        .values()
        .should('have.length', value)
        .logDetail(`should display ${value} number of idle checkbox values`);
    },
    numberOfIdleCheckboxValues: (value: number) => {
      if (value > 0) {
        selector
          .idleCheckbox()
          .should('have.length', value)
          .logDetail(`should display ${value} number of idle checkbox values`);
      } else {
        selector
          .idleCheckbox()
          .should('not.exist')
          .logDetail('should display no idle checkbox value');
      }
    },
    numberOfSelectedCheckboxValues: (value: number) => {
      if (value > 0) {
        selector
          .selectedCheckbox()
          .should('have.length', value)
          .logDetail(
            `should display ${value} number of selected checkbox values`
          );
      } else {
        selector
          .selectedCheckbox()
          .should('not.exist')
          .logDetail('should display no selected checkbox value');
      }
    },
    urlHashContains: (value: string) => {
      const urlHash = `#nf[${field.toLowerCase()}]=${encodeURI(value)}`;
      cy.url()
        .should('include', urlHash)
        .logDetail('should display range value on UrlHash');
    },
    logNumericFacetLoad: () => {
      cy.wait(InterceptAliases.UA.Load)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property(
            'actionCause',
            'interfaceLoad'
          );
        })
        .logDetail("should log the 'InterfaceLoad' UA event");
    },
    logNumericFacetSelect: (field: string, index: number) => {
      cy.wait(InterceptAliases.UA.Facet.Select)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            field
          );
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
        })
        .logDetail("should log the 'NumericFacetSelect' UA event");
    },
    logNumericFacetClearAll: (field: string) => {
      cy.wait(InterceptAliases.UA.Facet.ClearAll)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property(
            'actionCause',
            'facetClearAll'
          );
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            field
          );
        })
        .logDetail("should log the 'NumericFacetClearAll' UA event");
    },
  };
};
export const NumericFacetExpectations = {
  ...baseFacetExpectations(NumericFacetSelectors),
  ...numericFacetExpectations(NumericFacetSelectors),
};
