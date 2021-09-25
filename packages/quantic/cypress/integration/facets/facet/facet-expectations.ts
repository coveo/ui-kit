import {
  baseFacetExpectations,
  facetWithCheckboxExpectations,
  facetWithLinkExpectatinos,
  facetWithSearchExpectations,
  facetWithShowMoreLessExpectations,
} from '../facet-common-expectations';
import {FacetSelectors} from './facet-selectors';

export const FacetExpectations = {
  ...baseFacetExpectations(FacetSelectors),
  ...facetWithCheckboxExpectations(FacetSelectors),
  ...facetWithLinkExpectatinos(FacetSelectors),
  ...facetWithSearchExpectations(FacetSelectors),
  ...facetWithShowMoreLessExpectations(FacetSelectors),
};
