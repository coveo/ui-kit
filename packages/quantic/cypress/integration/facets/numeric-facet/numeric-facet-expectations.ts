import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {SearchExpectations} from '../../search-expectations';
import {
  baseFacetExpectations,
  facetWithValuesExpectations,
} from '../facet-common-expectations';
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
    displaySearchForm: (display: boolean) => {
      selector
        .searchForm()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the 'Manual range' form`);
    },
    inputMinEmpty: () => {
      selector
        .inputMin()
        .invoke('val')
        .should('be.empty')
        .logDetail('the min input should be empty');
    },
    inputMaxEmpty: () => {
      selector
        .inputMax()
        .invoke('val')
        .should('be.empty')
        .logDetail('the max input should be empty');
    },
    urlHashContains: (value: string, fromInput = false) => {
      const input = fromInput ? '_input' : '';
      const urlHash = `#nf[${field.toLowerCase()}${input}]=${encodeURI(value)}`;
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
  };
};
export const NumericFacetExpectations = {
  ...baseFacetExpectations(NumericFacetSelectors),
  ...numericFacetExpectations(NumericFacetSelectors),
  ...facetWithValuesExpectations(NumericFacetSelectors),
  search: {
    ...SearchExpectations,
  },
};
