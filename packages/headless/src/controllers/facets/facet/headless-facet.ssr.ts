import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {Facet, FacetProps, buildFacet} from './headless-facet';

export type {
  FacetOptions,
  FacetSearchOptions,
  FacetProps,
  FacetState,
  Facet,
  FacetValue,
  FacetValueState,
  FacetSearch,
  FacetSearchState,
  SpecificFacetSearchResult,
  CoreFacet,
  CoreFacetState,
} from './headless-facet';

/**
 * @internal
 */
export const defineFacet = (
  props: FacetProps
): ControllerDefinitionWithoutProps<SearchEngine, Facet> => ({
  build: (engine) => buildFacet(engine, props),
});
