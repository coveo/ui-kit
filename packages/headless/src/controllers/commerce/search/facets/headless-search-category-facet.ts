import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {loadReducerError} from '../../../../utils/errors';
import {
  CommerceCategoryFacet,
  buildCommerceCategoryFacet,
} from '../../facets/core/category/headless-commerce-category-facet';
import {CoreCommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';

export type SearchCategoryFacetOptions = Omit<
  CoreCommerceFacetOptions,
  | 'fetchResultsActionCreator'
  | 'toggleSelectActionCreator'
  | 'toggleExcludeActionCreator'
>;

export type SearchCategoryFacetBuilder = typeof buildSearchCategoryFacet;

export function buildSearchCategoryFacet(
  engine: CommerceEngine,
  options: SearchCategoryFacetOptions
): CommerceCategoryFacet {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceCategoryFacet(engine, {
    ...options,
    fetchResultsActionCreator: executeSearch,
  });
}
