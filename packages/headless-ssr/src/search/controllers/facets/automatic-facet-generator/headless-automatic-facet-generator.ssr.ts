import type {SearchEngine} from '@coveo/headless';
import {
  type AutomaticFacetGenerator,
  type AutomaticFacetGeneratorProps,
  buildAutomaticFacetGenerator,
} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../../types/controller-definition.js';

export {
  type AutomaticFacetGeneratorOptions,
  type AutomaticFacetGenerator,
  type AutomaticFacetGeneratorState,
  type AutomaticFacetGeneratorProps,
  type AutomaticFacetState,
  type AutomaticFacet,
} from '@coveo/headless';

export interface AutomaticFacetGeneratorDefinition extends ControllerDefinitionWithoutProps<
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
