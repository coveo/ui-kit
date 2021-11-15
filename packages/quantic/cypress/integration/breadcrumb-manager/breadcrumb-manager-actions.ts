import {baseFacetActions} from '../facets/facet-common-actions';
import {FacetSelectors} from '../facets/facet/facet-selectors';
import {
  BreadcrumbManagerSelector,
  BreadcrumbManagerSelectors,
} from './breadcrumb-manager-selectors';

function breadcrumbManagerActions(selector: BreadcrumbManagerSelector) {
  return {};
}

export const SortActions = {
  ...breadcrumbManagerActions(BreadcrumbManagerSelectors),
  ...baseFacetActions(FacetSelectors),
};
