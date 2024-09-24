import {
  CommerceFacetSetSection,
  CommerceQuerySection,
} from '../../../../state/state-sections.js';
import {StateNeededByQueryCommerceAPI} from '../../common/actions.js';
import {StateNeededForCategoryFacetSearch} from './category/commerce-category-facet-search-state.js';
import {StateNeededForRegularFacetSearch} from './regular/commerce-regular-facet-search-state.js';

export type CoreStateNeededForFacetSearch = StateNeededByQueryCommerceAPI &
  CommerceFacetSetSection &
  Partial<CommerceQuerySection>;

export type StateNeededForAnyFacetSearch =
  | StateNeededForRegularFacetSearch
  | StateNeededForCategoryFacetSearch;
