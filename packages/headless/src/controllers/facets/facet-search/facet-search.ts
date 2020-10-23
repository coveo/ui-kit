import {Engine} from '../../../app/headless-engine';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {executeSearch} from '../../../features/search/search-actions';
import {logFacetSelect} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {SpecificFacetSearchState} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {CategoryFacetSearchState} from '../../../features/facets/facet-search-set/category/category-facet-search-set-state';
import {FacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-request-options';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {executeFacetSearch} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {
  CategoryFacetSearchSection,
  ConfigurationSection,
  FacetSearchSection,
} from '../../../state/state-sections';

type FacetSearchState = SpecificFacetSearchState | CategoryFacetSearchState;

export interface GenericFacetSearchProps<T extends FacetSearchState> {
  options: FacetSearchOptions;
  getFacetSearch: () => T;
}

export type GenericFacetSearch = ReturnType<typeof buildGenericFacetSearch>;

export function buildGenericFacetSearch<T extends FacetSearchState>(
  engine: Engine<
    ConfigurationSection & (FacetSearchSection | CategoryFacetSearchSection)
  >,
  props: GenericFacetSearchProps<T>
) {
  type GenericFacetSearchResult = T['response']['values'][0];
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
    select(value: GenericFacetSearchResult) {
      const facetValue = value.rawValue;

      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetSelect({facetId, facetValue})));
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
