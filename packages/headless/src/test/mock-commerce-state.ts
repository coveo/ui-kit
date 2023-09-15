import {getProductListingV2InitialState} from '../features/commerce/product-listing/product-listing-state';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getCategoryFacetSetInitialState} from '../features/facets/category-facet-set/category-facet-set-state';
import {getFacetOrderInitialState} from '../features/facets/facet-order/facet-order-state';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-state';
import {getDateFacetSetInitialState} from '../features/facets/range-facets/date-facet-set/date-facet-set-state';
import {getNumericFacetSetInitialState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {getPaginationInitialState} from '../features/pagination/pagination-state';
import {getSortInitialState} from '../features/sort/sort-state';
import {CommerceAppState} from '../state/commerce-app-state';

export function buildMockCommerceState(
  config: Partial<CommerceAppState> = {}
): CommerceAppState {
  return {
    configuration: getConfigurationInitialState(),
    productListing: getProductListingV2InitialState(),
    sort: getSortInitialState(),
    categoryFacetSet: getCategoryFacetSetInitialState(),
    dateFacetSet: getDateFacetSetInitialState(),
    facetOrder: getFacetOrderInitialState(),
    facetSet: getFacetSetInitialState(),
    numericFacetSet: getNumericFacetSetInitialState(),
    pagination: getPaginationInitialState(),
    version: 'unit-testing-version',
    ...config,
  };
}
