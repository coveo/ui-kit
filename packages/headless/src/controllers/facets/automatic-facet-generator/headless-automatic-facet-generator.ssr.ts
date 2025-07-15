import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {
  type AutomaticFacetGenerator,
  type AutomaticFacetGeneratorProps,
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
 * @group Definers
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
