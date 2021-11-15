import {baseFacetActions} from '../facets/facet-common-actions';
import {FacetSelectors} from '../facets/facet/facet-selectors';
import {NumericFacetSelectors} from '../facets/numeric-facet/numeric-facet-selectors';
import {
  BreadcrumbManagerSelector,
  BreadcrumbManagerSelectors,
} from './breadcrumb-manager-selectors';

function breadcrumbManagerActions(selector: BreadcrumbManagerSelector) {
  return {};
}

export const BreadcrumbManagerActions = {
  ...breadcrumbManagerActions(BreadcrumbManagerSelectors),
  ...baseFacetActions(FacetSelectors),
  numerciFacet: {
    ...baseFacetActions(NumericFacetSelectors),
  },
};
