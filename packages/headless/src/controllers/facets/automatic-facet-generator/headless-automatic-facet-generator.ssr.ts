import {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {
  AutomaticFacetGenerator,
  AutomaticFacetGeneratorProps,
  buildAutomaticFacetGenerator,
} from './headless-automatic-facet-generator.js';

export * from './headless-automatic-facet-generator.js';

export interface AutomaticFacetGeneratorDefinition
  extends ControllerDefinitionWithoutProps<
    SearchEngine,
    AutomaticFacetGenerator
  > {}

/**
 * Defines an `AutomaticFacetGenerator` controller instance.
 *
 * @param props - The configurable `AutomaticFacetGenerator` properties.
 * @returns The `AutomaticFacetGenerator` controller definition.
 * */
export function defineAutomaticFacetGenerator(
  props: AutomaticFacetGeneratorProps
): AutomaticFacetGeneratorDefinition {
  return {
    build: (engine) => buildAutomaticFacetGenerator(engine, props),
  };
}
