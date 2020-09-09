import {Engine} from '../../../app/headless-engine';
import {
  updateFacetSearch,
  executeFacetSearch,
  selectFacetSearchResult,
} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {executeSearch} from '../../../features/search/search-actions';
import {logFacetSelect} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {SpecificFacetSearchState} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {CategoryFacetSearchState} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {SpecificFacetSearchResult} from '../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {FacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-request-options';

type FacetSearchState = SpecificFacetSearchState | CategoryFacetSearchState;

export interface GenericFacetSearchProps<T extends FacetSearchState> {
  options: FacetSearchOptions;
  getFacetSearch: () => T;
}

export type GenericFacetSearch = ReturnType<typeof buildGenericFacetSearch>;

export function buildGenericFacetSearch<T extends FacetSearchState>(
  engine: Engine,
  props: GenericFacetSearchProps<T>
) {
  const dispatch = engine.dispatch;
  const {options, getFacetSearch} = props;

  const facetId = options.facetId;
  const initialNumberOfValues = options.numberOfValues || 10;

  return {
    /** Updates the facet search query.
     * @param text The new query.
     */
    updateText(text: string) {
      const query = `*${text}*`;
      dispatch(
        updateFacetSearch({
          facetId,
          query,
          numberOfValues: initialNumberOfValues,
        })
      );
    },

    /** Increases number of results returned by numberOfResults */
    showMoreResults() {
      const {numberOfValues} = getFacetSearch().options;
      dispatch(
        updateFacetSearch({
          facetId,
          numberOfValues: numberOfValues + initialNumberOfValues,
        })
      );
      dispatch(executeFacetSearch(facetId));
    },

    /** Executes a facet search to update the values.*/
    search() {
      dispatch(executeFacetSearch(facetId));
    },

    /** Selects a search result.*/
    select(value: SpecificFacetSearchResult) {
      dispatch(selectFacetSearchResult({facetId, value}));
      dispatch(
        executeSearch(logFacetSelect({facetId, facetValue: value.rawValue}))
      );
    },

    get state() {
      const {response, isLoading} = getFacetSearch();
      return {
        ...response,
        isLoading,
      };
    },
  };
}
