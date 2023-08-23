import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getContextInitialState} from '../features/context/context-state';
import {getFacetOptionsInitialState} from '../features/facet-options/facet-options-state';
import {getCategoryFacetSetInitialState} from '../features/facets/category-facet-set/category-facet-set-state';
import {getFacetOrderInitialState} from '../features/facets/facet-order/facet-order-state';
import {getCategoryFacetSearchSetInitialState} from '../features/facets/facet-search-set/category/category-facet-search-set-state';
import {getFacetSearchSetInitialState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-state';
import {getDateFacetSetInitialState} from '../features/facets/range-facets/date-facet-set/date-facet-set-state';
import {getNumericFacetSetInitialState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {getPaginationInitialState} from '../features/pagination/pagination-state';
import {getProductListingV2InitialState} from '../features/product-listing/v2/product-listing-v2-state';
import {getSortInitialState} from '../features/sort/sort-state';
import {ProductListingV2AppState} from '../state/commerce-app-state';

export function buildMockProductListingV2State(
  config: Partial<ProductListingV2AppState> = {}
): ProductListingV2AppState {
  return {
    configuration: getConfigurationInitialState(),
    productListing: getProductListingV2InitialState(),
    sort: getSortInitialState(),
    facetSearchSet: getFacetSearchSetInitialState(),
    categoryFacetSet: getCategoryFacetSetInitialState(),
    categoryFacetSearchSet: getCategoryFacetSearchSetInitialState(),
    dateFacetSet: getDateFacetSetInitialState(),
    facetOptions: getFacetOptionsInitialState(),
    facetOrder: getFacetOrderInitialState(),
    facetSet: getFacetSetInitialState(),
    numericFacetSet: getNumericFacetSetInitialState(),
    pagination: getPaginationInitialState(),
    version: 'unit-testing-version',
    context: getContextInitialState(),
    ...config,
  };
}
