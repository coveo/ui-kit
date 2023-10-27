import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  AutomaticFacetGenerator,
  AutomaticFacetGeneratorProps,
  buildAutomaticFacetGenerator,
} from './headless-automatic-facet-generator';

export * from './headless-automatic-facet-generator';

/**
 * @alpha
 */
export const defineAutomaticFacetGenerator = (
  props: AutomaticFacetGeneratorProps
): ControllerDefinitionWithoutProps<SearchEngine, AutomaticFacetGenerator> => ({
  build: (engine) => buildAutomaticFacetGenerator(engine, props),
});
