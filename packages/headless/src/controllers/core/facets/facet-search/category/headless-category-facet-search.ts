import {AsyncThunkAction} from '@reduxjs/toolkit';
import {CategoryFacetSearchResult} from '../../../../../api/search/facet-search/category-facet-search/category-facet-search-response';
import {AsyncThunkOptions} from '../../../../../app/async-thunk-options';
import {CoreEngine, CoreEngineNext} from '../../../../../app/engine';
import {stateKey} from '../../../../../app/state-key';
import {ThunkExtraArguments} from '../../../../../app/thunk-extra-arguments';
import {
  registerCategoryFacetSearch,
  selectCategoryFacetSearchResult,
} from '../../../../../features/facets/facet-search-set/category/category-facet-search-actions';
import {defaultFacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-reducer-helpers';
import {FacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-request-options';
import {
  CategoryFacetSearchSection,
  ConfigurationSection,
} from '../../../../../state/state-sections';
import {buildGenericFacetSearch} from '../facet-search';

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
    | CoreEngineNext<CategoryFacetSearchSection & ConfigurationSection>,
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
