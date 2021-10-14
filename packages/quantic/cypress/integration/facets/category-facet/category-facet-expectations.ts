import {
  baseFacetExpectations,
  facetWithValuesExpectations,
  facetWithSearchExpectations,
  facetWithShowMoreLessExpectations,
} from '../facet-common-expectations';
import {CategoryFacetSelectors} from './category-facet-selectors';

export const FacetExpectations = {
  ...baseFacetExpectations(CategoryFacetSelectors),
  ...facetWithValuesExpectations(CategoryFacetSelectors),
  ...facetWithSearchExpectations(CategoryFacetSelectors),
  ...facetWithShowMoreLessExpectations(CategoryFacetSelectors),
};
