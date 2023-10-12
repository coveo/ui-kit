import {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {
  AutomaticFacetGenerator,
  AutomaticFacetGeneratorProps,
  buildAutomaticFacetGenerator,
} from './headless-automatic-facet-generator.js';

export * from './headless-automatic-facet-generator.js';

/**
 * @internal
 */
export const defineAutomaticFacetGenerator = (
  props: AutomaticFacetGeneratorProps
): ControllerDefinitionWithoutProps<SearchEngine, AutomaticFacetGenerator> => ({
  build: (engine) => buildAutomaticFacetGenerator(engine, props),
});
