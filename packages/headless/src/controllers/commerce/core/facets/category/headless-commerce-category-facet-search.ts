import type {FacetSearchType} from '../../../../../api/commerce/facet-search/facet-search-request.js';
import type {CategoryFacetSearchResult} from '../../../../../api/search/facet-search/category-facet-search/category-facet-search-response.js';
import type {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine.js';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../../../features/facets/facet-search-set/category/category-facet-search-set-slice.js';
import type {FacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-request-options.js';
import type {CategoryFacetSearchSection} from '../../../../../state/state-sections.js';
import {loadReducerError} from '../../../../../utils/errors.js';
import {
  buildCoreCategoryFacetSearch,
  type CategoryFacetSearchProps as CoreCategoryFacetSearchProps,
} from '../../../../core/facets/facet-search/category/headless-category-facet-search.js';
import type {CoreFacetSearchState} from '../searchable/headless-commerce-searchable-facet.js';

export type CategoryFacetSearchProps = Omit<
  CoreCategoryFacetSearchProps,
  'executeFacetSearchActionCreator' | 'executeFieldSuggestActionCreator'
> & {
  options: FacetSearchOptions & {type: FacetSearchType};
};

export type CategoryFacetSearchState =
  CoreFacetSearchState<CategoryFacetSearchResult>;

export type CategoryFacetSearch = Omit<
  ReturnType<typeof buildCoreCategoryFacetSearch>,
  'updateCaptions' | 'state'
>;

export function buildCategoryFacetSearch(
  engine: CommerceEngine,
  props: CategoryFacetSearchProps
): CategoryFacetSearch {
  if (!loadCategoryFacetSearchReducers(engine)) {
    throw loadReducerError;
  }

  const {
    state: _state,
    updateCaptions: _updateCaptions,
    ...restOfFacetSearch
  } = buildCoreCategoryFacetSearch(engine, {
    ...props,
    executeFacetSearchActionCreator: (facetId: string) =>
      executeCommerceFacetSearch({
        facetId,
        facetSearchType: props.options.type,
      }),
    executeFieldSuggestActionCreator: (facetId: string) =>
      executeCommerceFieldSuggest({
        facetId,
        facetSearchType: props.options.type,
      }),
  });

  return restOfFacetSearch;
}

function loadCategoryFacetSearchReducers(
  engine: CommerceEngine
): engine is CommerceEngine<CategoryFacetSearchSection> {
  engine.addReducers({categoryFacetSearchSet});
  return true;
}
