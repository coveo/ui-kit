import {
  baseFacetActions,
  facetWithSearchActions,
  facetWithShowMoreLessActions,
} from '../facet-common-actions';
import {FacetSelectors} from './facet-selectors';

export const FacetActions = {
  ...baseFacetActions(FacetSelectors),
  ...facetWithSearchActions(FacetSelectors),
  ...facetWithShowMoreLessActions(FacetSelectors),
};
