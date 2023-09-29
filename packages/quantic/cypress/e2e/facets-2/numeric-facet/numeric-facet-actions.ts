import {
  baseFacetActions,
  facetWithValuesActions,
} from '../../facets-1/facet-common-actions';
import {
  AllFacetSelectors,
  NumericFacetSelectors,
} from './numeric-facet-selectors';

const numericFacetActions = (selector: AllFacetSelectors) => {
  return {
    inputMinValue: (value: number | string) => {
      selector.inputMin().type(value.toString(), {force: true});
    },
    inputMaxValue: (value: number | string) => {
      selector.inputMax().type(value.toString(), {force: true});
    },
    submitManualRange: () => {
      selector.searchForm().submit();
    },
    selectFirstNumericFacetValueWithKeyboardTab: () => {
      selector.collapseButton().realPress(['Tab', 'Space']);
    },
    selectFirstNumericFacetValueWithKeyboardEnter: () => {
      selector.collapseButton().realPress(['Tab', 'Enter']);
    },
  };
};

export const NumericFacetActions = {
  ...numericFacetActions(NumericFacetSelectors),
  ...baseFacetActions(NumericFacetSelectors),
  ...facetWithValuesActions(NumericFacetSelectors),
};
