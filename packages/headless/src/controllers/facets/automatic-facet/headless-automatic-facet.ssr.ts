import {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {
  AutomaticFacet,
  AutomaticFacetProps,
  buildAutomaticFacet,
} from './headless-automatic-facet.js';

export * from './headless-automatic-facet.js';

/**
 * @internal
 */
export const defineAutomaticFacet = (
  props: AutomaticFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, AutomaticFacet> => ({
  build: (engine) => buildAutomaticFacet(engine, props),
});
