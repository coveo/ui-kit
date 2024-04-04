import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {Facet, FacetProps, buildFacet} from './headless-facet';

export * from './headless-facet';

/**
 * @alpha
 */
export const defineFacet = (
  props: FacetProps
): ControllerDefinitionWithoutProps<SearchEngine, Facet> => ({
  build: (engine) => buildFacet(engine, props),
});
