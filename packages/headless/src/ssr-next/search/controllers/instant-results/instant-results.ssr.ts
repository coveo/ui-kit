import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildInstantResults,
  type InstantResultProps,
  type InstantResults,
} from '../../../../controllers/instant-results/instant-results.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/instant-results/instant-results.js';

export interface InstantResultsDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, InstantResults> {}

/**
 * Defines an `InstantResults` controller instance.
 * @group Definers
 *
 * @param props - The configurable `InstantResults` properties.
 * @returns The `InstantResults` controller definition.
 * */
export function defineInstantResults(
  props: InstantResultProps
): InstantResultsDefinition {
  return {
    build: (engine) => buildInstantResults(engine, props),
  };
}
