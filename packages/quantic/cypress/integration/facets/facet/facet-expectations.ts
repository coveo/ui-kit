import {
  baseFacetExpectations,
  facetWithValuesExpectations,
  facetWithSearchExpectations,
  facetWithShowMoreLessExpectations,
} from '../facet-common-expectations';
import {FacetSelectors} from './facet-selectors';

export const FacetExpectations = {
  ...baseFacetExpectations(FacetSelectors),
  ...facetWithValuesExpectations(FacetSelectors),
  ...facetWithSearchExpectations(FacetSelectors),
  ...facetWithShowMoreLessExpectations(FacetSelectors),
};
