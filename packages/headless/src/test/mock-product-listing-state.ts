import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {ProductListingAppState} from '../state/product-listing-app-state';
import {getProductListingInitialState} from '../features/product-listing/product-listing-state';
import {getCategoryFacetSetInitialState} from '../features/facets/category-facet-set/category-facet-set-state';
import {getDateFacetSetInitialState} from '../features/facets/range-facets/date-facet-set/date-facet-set-state';
import {getFacetOptionsInitialState} from '../features/facet-options/facet-options-state';
import {getFacetOrderInitialState} from '../features/facets/facet-order/facet-order-state';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-state';
import {getNumericFacetSetInitialState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {getPaginationInitialState} from '../features/pagination/pagination-state';
import {getSortCriteriaInitialState} from '../features/sort-criteria/sort-criteria-state';

export function buildMockProductListingState(
  config: Partial<ProductListingAppState> = {}
): ProductListingAppState {
  return {
    configuration: getConfigurationInitialState(),
    productListing: getProductListingInitialState(),
    categoryFacetSet: getCategoryFacetSetInitialState(),
    dateFacetSet: getDateFacetSetInitialState(),
    facetOptions: getFacetOptionsInitialState(),
    facetOrder: getFacetOrderInitialState(),
    facetSet: getFacetSetInitialState(),
    numericFacetSet: getNumericFacetSetInitialState(),
    pagination: getPaginationInitialState(),
    sortCriteria: getSortCriteriaInitialState(),
    version: 'unit-testing-version',
    ...config,
  };
}
