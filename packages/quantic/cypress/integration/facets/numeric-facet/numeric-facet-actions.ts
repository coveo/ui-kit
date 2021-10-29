import {baseFacetActions} from '../facet-common-actions';
import {
  AllFacetSelectors,
  NumericFacetSelectors,
} from './numeric-facet-selectors';

export const field = 'ytlikecount';

const numericFacetActions = (selector: AllFacetSelectors) => {
  return {};
};

export const NumericFacetActions = {
  ...numericFacetActions(NumericFacetSelectors),
  ...baseFacetActions(NumericFacetSelectors),
};
