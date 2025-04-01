import {ComponentErrorExpectations} from '../../common-expectations';
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
  ...ComponentErrorExpectations(FacetSelectors),
};
