import {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {Facet, FacetProps, buildFacet} from './headless-facet.js';

export * from './headless-facet.js';

export interface FacetDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, Facet> {}

/**
 * Defines a `Facet` controller instance.
 *
 * @param props - The configurable `Facet` properties.
 * @returns The `Facet` controller definition.
 * */
export function defineFacet(props: FacetProps): FacetDefinition {
  return {
    build: (engine) => buildFacet(engine, props),
  };
}
