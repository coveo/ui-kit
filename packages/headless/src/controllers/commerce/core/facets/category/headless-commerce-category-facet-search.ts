import {CategoryFacetSearchResult} from '../../../../../api/search/facet-search/category-facet-search/category-facet-search-response';
import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../../../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {CategoryFacetSearchSection} from '../../../../../state/state-sections';
import {loadReducerError} from '../../../../../utils/errors';
import {
  CategoryFacetSearchProps as CoreCategoryFacetSearchProps,
  buildCoreCategoryFacetSearch,
} from '../../../../core/facets/facet-search/category/headless-category-facet-search';
import {CoreFacetSearchState} from '../searchable/headless-commerce-searchable-facet';

export type CategoryFacetSearchProps = Omit<
  CoreCategoryFacetSearchProps,
  'executeFacetSearchActionCreator' | 'executeFieldSuggestActionCreator'
>;

export type CategoryFacetSearchState =
  CoreFacetSearchState<CategoryFacetSearchResult>;

export type CategoryFacetSearch = Omit<
  ReturnType<typeof buildCoreCategoryFacetSearch>,
  'showMoreResults' | 'updateCaptions' | 'state'
> & {
  state: CategoryFacetSearchState;
};

export function buildCategoryFacetSearch(
  engine: CommerceEngine,
  props: CategoryFacetSearchProps
): CategoryFacetSearch {
  if (!loadCategoryFacetSearchReducers(engine)) {
    throw loadReducerError;
  }

  const {showMoreResults, updateCaptions, ...restOfFacetSearch} =
    buildCoreCategoryFacetSearch(engine, {
      ...props,
      executeFacetSearchActionCreator: executeCommerceFacetSearch,
      executeFieldSuggestActionCreator: executeCommerceFieldSuggest,
    });

  return restOfFacetSearch;
}

function loadCategoryFacetSearchReducers(
  engine: CommerceEngine
): engine is CommerceEngine<CategoryFacetSearchSection> {
  engine.addReducers({categoryFacetSearchSet});
  return true;
}
