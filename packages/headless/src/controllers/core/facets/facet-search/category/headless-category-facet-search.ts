import type {AsyncThunkAction} from '@reduxjs/toolkit';
import type {CategoryFacetSearchResult} from '../../../../../api/search/facet-search/category-facet-search/category-facet-search-response.js';
import type {AsyncThunkOptions} from '../../../../../app/async-thunk-options.js';
import type {CoreEngine, CoreEngineNext} from '../../../../../app/engine.js';
import {stateKey} from '../../../../../app/state-key.js';
import type {ThunkExtraArguments} from '../../../../../app/thunk-extra-arguments.js';
import {
  registerCategoryFacetSearch,
  selectCategoryFacetSearchResult,
} from '../../../../../features/facets/facet-search-set/category/category-facet-search-actions.js';
import {defaultFacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-reducer-helpers.js';
import type {FacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-request-options.js';
import type {
  CategoryFacetSearchSection,
  ConfigurationSection,
} from '../../../../../state/state-sections.js';
import {buildGenericFacetSearch} from '../facet-search.js';

export interface CategoryFacetSearchProps {
  options: FacetSearchOptions;
  isForFieldSuggestions: boolean;
  select: (value: CategoryFacetSearchResult) => void;
  executeFacetSearchActionCreator: (
    facetId: string
  ) => AsyncThunkAction<
    unknown,
    unknown,
    AsyncThunkOptions<unknown, ThunkExtraArguments>
  >;
  executeFieldSuggestActionCreator: (
    facetId: string
  ) => AsyncThunkAction<
    unknown,
    unknown,
    AsyncThunkOptions<unknown, ThunkExtraArguments>
  >;
}

export type CategoryFacetSearch = ReturnType<
  typeof buildCoreCategoryFacetSearch
>;

export function buildCoreCategoryFacetSearch(
  engine:
    | CoreEngine<CategoryFacetSearchSection & ConfigurationSection>
    | CoreEngineNext<CategoryFacetSearchSection>,
  props: CategoryFacetSearchProps
) {
  const {dispatch} = engine;
  const options = {...defaultFacetSearchOptions, ...props.options};
  const {facetId} = options;
  const getFacetSearch = () =>
    'state' in engine
      ? engine.state.categoryFacetSearchSet[facetId]
      : engine[stateKey].categoryFacetSearchSet[facetId];

  dispatch(registerCategoryFacetSearch(options));

  const genericFacetSearch = buildGenericFacetSearch(engine, {
    options,
    getFacetSearch,
    isForFieldSuggestions: props.isForFieldSuggestions,
    executeFacetSearchActionCreator: props.executeFacetSearchActionCreator,
    executeFieldSuggestActionCreator: props.executeFieldSuggestActionCreator,
  });

  return {
    ...genericFacetSearch,

    select(value: CategoryFacetSearchResult) {
      dispatch(
        selectCategoryFacetSearchResult({
          facetId,
          value,
        })
      );
      props.select(value);
    },

    get state() {
      return genericFacetSearch.state;
    },
  };
}
