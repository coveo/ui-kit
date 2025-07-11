import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildInstantResults,
  type InstantResultProps,
  type InstantResults,
} from './instant-results.js';

export * from './instant-results.js';

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
