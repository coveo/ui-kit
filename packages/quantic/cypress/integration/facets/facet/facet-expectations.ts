import {
  baseFacetExpectations,
  facetWithCheckboxExpectations,
  facetWithSearchExpectations,
  facetWithShowMoreLessExpectations,
} from '../facet-common-expectations';
import {FacetSelectors} from './facet-selectors';

export const FacetExpectations = {
  ...baseFacetExpectations(FacetSelectors),
  ...facetWithCheckboxExpectations(FacetSelectors),
  ...facetWithSearchExpectations(FacetSelectors),
  ...facetWithShowMoreLessExpectations(FacetSelectors),
};
