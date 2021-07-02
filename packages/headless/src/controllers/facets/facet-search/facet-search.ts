import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {executeSearch} from '../../../features/search/search-actions';
import {logFacetSelect} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {SpecificFacetSearchState} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {CategoryFacetSearchState} from '../../../features/facets/facet-search-set/category/category-facet-search-set-state';
import {FacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-request-options';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {
  clearFacetSearch,
  executeFacetSearch,
} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {
  CategoryFacetSearchSection,
  ConfigurationSection,
  FacetSearchSection,
} from '../../../state/state-sections';
import {SearchEngine} from '../../../app/search-engine/search-engine';

type FacetSearchState = SpecificFacetSearchState | CategoryFacetSearchState;

export interface GenericFacetSearchProps<T extends FacetSearchState> {
  options: FacetSearchOptions;
  getFacetSearch: () => T;
}

export type GenericFacetSearch = ReturnType<typeof buildGenericFacetSearch>;

export function buildGenericFacetSearch<T extends FacetSearchState>(
  engine: SearchEngine<
    ConfigurationSection & (FacetSearchSection | CategoryFacetSearchSection)
  >,
  props: GenericFacetSearchProps<T>
) {
  type GenericFacetSearchResults = T['response']['values'];
  type GenericFacetSearchResult = GenericFacetSearchResults[0];

  const dispatch = engine.dispatch;
  const {options, getFacetSearch} = props;
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
      dispatch(executeFacetSearch(facetId));
    },

    /** Executes a facet search to update the values.*/
    search() {
      dispatch(executeFacetSearch(facetId));
    },

    /** Selects a search result.*/
    select(value: GenericFacetSearchResult) {
      const facetValue = value.rawValue;

      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetSelect({facetId, facetValue})));
    },

    /** Resets the query and empties the values. */
    clear() {
      dispatch(clearFacetSearch({facetId}));
    },

    get state() {
      const {response, isLoading, options} = getFacetSearch();
      const {query} = options;
      const values: GenericFacetSearchResults = response.values;

      return {
        ...response,
        values,
        isLoading,
        query,
      };
    },
  };
}
