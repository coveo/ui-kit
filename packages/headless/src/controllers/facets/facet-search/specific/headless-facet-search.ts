import {Engine} from '../../../../app/headless-engine';
import {registerFacetSearch} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {buildGenericFacetSearch} from '../facet-search';
import {FacetSearchOptions} from '../../../../features/facets/facet-search-set/facet-search-request-options';

export interface FacetSearchProps {
  options: FacetSearchOptions;
}

export type FacetSearch = ReturnType<typeof buildFacetSearch>;

export function buildFacetSearch(engine: Engine, props: FacetSearchProps) {
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

    get state() {
      return genericFacetSearch.state;
    },
  };
}
