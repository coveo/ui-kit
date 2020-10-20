import {Engine} from '../../../../app/headless-engine';
import {
  registerFacetSearch,
  selectFacetSearchResult,
} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {buildGenericFacetSearch} from '../facet-search';
import {FacetSearchOptions} from '../../../../features/facets/facet-search-set/facet-search-request-options';
import {SpecificFacetSearchResult} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {SearchAppState} from '../../../../state/search-app-state';

export interface FacetSearchProps {
  options: FacetSearchOptions;
}

export type FacetSearch = ReturnType<typeof buildFacetSearch>;

export function buildFacetSearch(
  engine: Engine<SearchAppState>,
  props: FacetSearchProps
) {
  const {dispatch} = engine;
  const {options} = props;
  const {facetId} = options;
  const getFacetSearch = () => engine.state.facetSearchSet[facetId];

  dispatch(registerFacetSearch(options));

  const genericFacetSearch = buildGenericFacetSearch(engine, {
    options,
    getFacetSearch,
  });

  return {
    ...genericFacetSearch,

    /**
     * Selects the provided value if unselected
     * @param result A single specificFacetSearchResult object
     */
    select(value: SpecificFacetSearchResult) {
      dispatch(selectFacetSearchResult({facetId, value}));
      genericFacetSearch.select(value);
    },

    get state() {
      return genericFacetSearch.state;
    },
  };
}
