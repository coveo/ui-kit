import type {AsyncThunkAction} from '@reduxjs/toolkit';
import type {FacetSearchAPIClient} from '../../../../api/search/search-api-client.js';
import type {AsyncThunkOptions} from '../../../../app/async-thunk-options.js';
import type {CoreEngine, CoreEngineNext} from '../../../../app/engine.js';
import type {
  ClientThunkExtraArguments,
  ThunkExtraArguments,
} from '../../../../app/thunk-extra-arguments.js';
import type {CategoryFacetSearchState} from '../../../../features/facets/facet-search-set/category/category-facet-search-set-state.js';
import type {FacetSearchOptions} from '../../../../features/facets/facet-search-set/facet-search-request-options.js';
import {clearFacetSearch} from '../../../../features/facets/facet-search-set/generic/generic-facet-search-actions.js';
import {updateFacetSearch} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import type {SpecificFacetSearchState} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-set-state.js';
import type {
  CategoryFacetSearchSection,
  FacetSearchSection,
} from '../../../../state/state-sections.js';

type FacetSearchState = SpecificFacetSearchState | CategoryFacetSearchState;

export interface GenericFacetSearchProps<T extends FacetSearchState> {
  options: FacetSearchOptions;
  getFacetSearch: () => T;
  isForFieldSuggestions: boolean;

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

export type GenericFacetSearch = ReturnType<typeof buildGenericFacetSearch>;

export function buildGenericFacetSearch<T extends FacetSearchState>(
  engine:
    | CoreEngine<
        FacetSearchSection | CategoryFacetSearchSection,
        ClientThunkExtraArguments<FacetSearchAPIClient>
      >
    | CoreEngineNext<
        FacetSearchSection | CategoryFacetSearchSection,
        ClientThunkExtraArguments<FacetSearchAPIClient>
      >,
  props: GenericFacetSearchProps<T>
) {
  const dispatch = engine.dispatch;
  const {
    options,
    getFacetSearch,
    executeFacetSearchActionCreator,
    executeFieldSuggestActionCreator,
  } = props;
  const {facetId} = options;

  return {
    /** Updates the facet search query.
     * @param text The new query.
     */
    updateText(text: string) {
      dispatch(
        updateFacetSearch({
          facetId,
          query: text,
          numberOfValues: getFacetSearch().initialNumberOfValues,
        })
      );
    },

    /** Increases number of results returned by numberOfResults */
    showMoreResults() {
      const {initialNumberOfValues, options} = getFacetSearch();
      dispatch(
        updateFacetSearch({
          facetId,
          numberOfValues: options.numberOfValues + initialNumberOfValues,
        })
      );
      dispatch(
        props.isForFieldSuggestions
          ? executeFieldSuggestActionCreator(facetId)
          : executeFacetSearchActionCreator(facetId)
      );
    },

    /** Executes a facet search to update the values.*/
    search() {
      dispatch(
        props.isForFieldSuggestions
          ? executeFieldSuggestActionCreator(facetId)
          : executeFacetSearchActionCreator(facetId)
      );
    },

    /** Resets the query and empties the values. */
    clear() {
      dispatch(clearFacetSearch({facetId}));
    },

    /**
     * Updates the facet value captions.
     * @param captions - A dictionary that maps index field values to facet value display names.
     */
    updateCaptions(captions: Record<string, string>) {
      dispatch(
        updateFacetSearch({
          facetId,
          captions,
        })
      );
    },

    get state() {
      const {response, isLoading, options} = getFacetSearch();
      const {query} = options;
      const values: T['response']['values'] = response.values;

      return {
        ...response,
        values,
        isLoading,
        query,
      };
    },
  };
}
