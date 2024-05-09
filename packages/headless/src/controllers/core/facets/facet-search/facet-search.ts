import {AsyncThunkAction} from '@reduxjs/toolkit';
import {FacetSearchAPIClient} from '../../../../api/search/search-api-client';
import {AsyncThunkOptions} from '../../../../app/async-thunk-options';
import {CoreEngine, CoreEngineNext} from '../../../../app/engine';
import {
  ClientThunkExtraArguments,
  ThunkExtraArguments,
} from '../../../../app/thunk-extra-arguments';
import {CategoryFacetSearchState} from '../../../../features/facets/facet-search-set/category/category-facet-search-set-state';
import {FacetSearchOptions} from '../../../../features/facets/facet-search-set/facet-search-request-options';
import {clearFacetSearch} from '../../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {updateFacetSearch} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {SpecificFacetSearchState} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {
  CategoryFacetSearchSection,
  ConfigurationSection,
  FacetSearchSection,
} from '../../../../state/state-sections';

type FacetSearchState = SpecificFacetSearchState | CategoryFacetSearchState;

export interface GenericFacetSearchProps<T extends FacetSearchState> {
  options: FacetSearchOptions;
  getFacetSearch: () => T;
  isForFieldSuggestions: boolean;

  executeFacetSearchActionCreator: (
    facetId: string
  ) => AsyncThunkAction<
    unknown,
    string,
    AsyncThunkOptions<unknown, ThunkExtraArguments>
  >;
  executeFieldSuggestActionCreator: (
    facetId: string
  ) => AsyncThunkAction<
    unknown,
    string,
    AsyncThunkOptions<unknown, ThunkExtraArguments>
  >;
}

export type GenericFacetSearch = ReturnType<typeof buildGenericFacetSearch>;

export function buildGenericFacetSearch<T extends FacetSearchState>(
  engine:
    | CoreEngine<
        ConfigurationSection &
          (FacetSearchSection | CategoryFacetSearchSection),
        ClientThunkExtraArguments<FacetSearchAPIClient>
      >
    | CoreEngineNext<
        ConfigurationSection &
          (FacetSearchSection | CategoryFacetSearchSection),
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
