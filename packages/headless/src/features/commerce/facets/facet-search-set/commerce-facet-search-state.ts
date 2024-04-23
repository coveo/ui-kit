import {
  CommerceFacetSetSection,
  CommerceQuerySection,
} from '../../../../state/state-sections';
import {StateNeededByQueryCommerceAPI} from '../../common/actions';
import {StateNeededForCategoryFacetSearch} from './category/commerce-category-facet-search-state';
import {StateNeededForRegularFacetSearch} from './regular/commerce-regular-facet-search-state';

export type CoreStateNeededForFacetSearch = StateNeededByQueryCommerceAPI &
  CommerceFacetSetSection &
  Partial<CommerceQuerySection>;

export type StateNeededForAnyFacetSearch =
  | StateNeededForRegularFacetSearch
  | StateNeededForCategoryFacetSearch;
