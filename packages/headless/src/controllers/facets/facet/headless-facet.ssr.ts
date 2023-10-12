import {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {Facet, FacetProps, buildFacet} from './headless-facet.js';

export * from './headless-facet.js';

/**
 * @internal
 */
export const defineFacet = (
  props: FacetProps
): ControllerDefinitionWithoutProps<SearchEngine, Facet> => ({
  build: (engine) => buildFacet(engine, props),
});
