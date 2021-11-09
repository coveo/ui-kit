import {baseFacetActions} from '../facet-common-actions';
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
  };
};

export const NumericFacetActions = {
  ...numericFacetActions(NumericFacetSelectors),
  ...baseFacetActions(NumericFacetSelectors),
};
