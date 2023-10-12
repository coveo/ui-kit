import {SpecificFacetSearchResult} from '../../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response.js';
import {CoreEngine} from '../../../../../app/engine.js';
import {FacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-request-options.js';
import {
  excludeFacetSearchResult,
  registerFacetSearch,
  selectFacetSearchResult,
} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions.js';
import {
  ConfigurationSection,
  FacetSearchSection,
} from '../../../../../state/state-sections.js';
import {buildGenericFacetSearch} from '../facet-search.js';

export interface FacetSearchProps {
  options: FacetSearchOptions;
  select: (value: SpecificFacetSearchResult) => void;
  exclude: (value: SpecificFacetSearchResult) => void;
  isForFieldSuggestions: boolean;
}

export type FacetSearch = ReturnType<typeof buildFacetSearch>;

export function buildFacetSearch(
  engine: CoreEngine<FacetSearchSection & ConfigurationSection>,
  props: FacetSearchProps
) {
  const {dispatch} = engine;
  const {
    options,
    select: propsSelect,
    exclude: propsExclude,
    isForFieldSuggestions,
  } = props;
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
      propsSelect(value);
    },

    /**
     * Excludes the provided value.
     * @param result A single specificFacetSearchResult object
     */
    exclude(value: SpecificFacetSearchResult) {
      dispatch(excludeFacetSearchResult({facetId, value}));
      propsExclude(value);
    },

    /**
     * Selects the provided value, and deselects other values.
     * @param result A single specificFacetSearchResult object
     */
    singleSelect(value: SpecificFacetSearchResult) {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(selectFacetSearchResult({facetId, value}));
      propsSelect(value);
    },

    /**
     * Excludes the provided value, and deselects other values.
     * @param result A single specificFacetSearchResult object
     */
    singleExclude(value: SpecificFacetSearchResult) {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(excludeFacetSearchResult({facetId, value}));
      propsExclude(value);
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
