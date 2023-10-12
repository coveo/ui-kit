import {getConfigurationInitialState} from '../features/configuration/configuration-state.js';
import {getContextInitialState} from '../features/context/context-state.js';
import {getFacetOptionsInitialState} from '../features/facet-options/facet-options-state.js';
import {getCategoryFacetSetInitialState} from '../features/facets/category-facet-set/category-facet-set-state.js';
import {getFacetOrderInitialState} from '../features/facets/facet-order/facet-order-state.js';
import {getCategoryFacetSearchSetInitialState} from '../features/facets/facet-search-set/category/category-facet-search-set-state.js';
import {getFacetSearchSetInitialState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state.js';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-state.js';
import {getDateFacetSetInitialState} from '../features/facets/range-facets/date-facet-set/date-facet-set-state.js';
import {getNumericFacetSetInitialState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state.js';
import {getPaginationInitialState} from '../features/pagination/pagination-state.js';
import {getProductListingInitialState} from '../features/product-listing/product-listing-state.js';
import {getSortInitialState} from '../features/sort/sort-state.js';
import {ProductListingAppState} from '../state/product-listing-app-state.js';

export function buildMockProductListingState(
  config: Partial<ProductListingAppState> = {}
): ProductListingAppState {
  return {
    configuration: getConfigurationInitialState(),
    productListing: getProductListingInitialState(),
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
