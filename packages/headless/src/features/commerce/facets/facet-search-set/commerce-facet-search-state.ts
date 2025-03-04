import {
  CommerceFacetSetSection,
  CommerceQuerySection,
} from '../../../../state/state-sections.js';
import {StateNeededForPaginatedCommerceAPIRequest} from '../../common/paginated-commerce-api-request-builder.js';
import {StateNeededForCategoryFacetSearch} from './category/commerce-category-facet-search-state.js';
import {StateNeededForRegularFacetSearch} from './regular/commerce-regular-facet-search-state.js';

export type CoreStateNeededForFacetSearch =
  StateNeededForPaginatedCommerceAPIRequest &
    CommerceFacetSetSection &
    Partial<CommerceQuerySection>;

export type StateNeededForAnyFacetSearch =
  | StateNeededForRegularFacetSearch
  | StateNeededForCategoryFacetSearch;
