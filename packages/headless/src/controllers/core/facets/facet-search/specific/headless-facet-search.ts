import {SpecificFacetSearchResult} from '../../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {CoreEngine} from '../../../../../app/engine';
import {FacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-request-options';
import {
  registerFacetSearch,
  selectFacetSearchResult,
} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions';
import {
  ConfigurationSection,
  FacetSearchSection,
} from '../../../../../state/state-sections';
import {buildGenericFacetSearch} from '../facet-search';

export interface FacetSearchProps {
  options: FacetSearchOptions;
  select: (value: SpecificFacetSearchResult) => void;
  isForFieldSuggestions: boolean;
}

export type FacetSearch = ReturnType<typeof buildFacetSearch>;

export function buildFacetSearch(
  engine: CoreEngine<FacetSearchSection & ConfigurationSection>,
  props: FacetSearchProps
) {
  const {dispatch} = engine;
  const {options, select, isForFieldSuggestions} = props;
  const {facetId} = options;
  const getFacetSearch = () => engine.state.facetSearchSet[facetId];

  dispatch(registerFacetSearch(options));

  const genericFacetSearch = buildGenericFacetSearch(engine, {
    options,
    getFacetSearch,
    isForFieldSuggestions,
  });

  return {
    ...genericFacetSearch,

    /**
     * Selects the provided value.
     * @param result A single specificFacetSearchResult object
     */
    select(value: SpecificFacetSearchResult) {
      dispatch(selectFacetSearchResult({facetId, value}));
      select(value);
    },

    /**
     * Selects the provided value, and deselects other values.
     * @param result A single specificFacetSearchResult object
     */
    singleSelect(value: SpecificFacetSearchResult) {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(selectFacetSearchResult({facetId, value}));
      select(value);
    },

    get state() {
      const {values} = genericFacetSearch.state;
      return {
        ...genericFacetSearch.state,
        values: values.map(({count, displayValue, rawValue}) => ({
          count,
          displayValue,
          rawValue,
        })),
      };
    },
  };
}
