import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  AutomaticFacetGenerator,
  AutomaticFacetGeneratorProps,
  buildAutomaticFacetGenerator,
} from './headless-automatic-facet-generator';

export * from './headless-automatic-facet-generator';

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
