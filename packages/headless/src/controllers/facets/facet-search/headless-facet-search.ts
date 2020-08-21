import {Engine} from '../../../app/headless-engine';
import {
  FacetSearchOptions,
  registerFacetSearch,
  updateFacetSearch,
  executeFacetSearch,
  selectFacetSearchResult,
} from '../../../features/facets/facet-search-set/facet-search-actions';
import {FacetSearchResult} from '../../../api/search/facet-search/facet-search-response';
import {executeSearch} from '../../../features/search/search-actions';
import {logFacetSelect} from '../../../features/facets/facet-set/facet-set-analytics-actions';

export interface FacetSearchProps {
  options: FacetSearchOptions;
}

export type FacetSearch = ReturnType<typeof buildFacetSearch>;

export function buildFacetSearch(engine: Engine, props: FacetSearchProps) {
  const dispatch = engine.dispatch;
  const facetId = props.options.facetId;
  const initialNumberOfValues = props.options.numberOfValues || 10;

  dispatch(registerFacetSearch(props.options));

  const getFacetSearch = () => {
    return engine.state.facetSearchSet[facetId];
  };

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
    /**
     * Increases number of results returned by numberOfResults
     */
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
    select(value: FacetSearchResult) {
      dispatch(selectFacetSearchResult({facetId, value}));
      dispatch(
        executeSearch(logFacetSelect({facetId, facetValue: value.rawValue}))
      );
    },
    get state() {
      const facetSearch = getFacetSearch();
      return {
        ...facetSearch.response,
        isLoading: facetSearch.isLoading,
      };
    },
  };
}
