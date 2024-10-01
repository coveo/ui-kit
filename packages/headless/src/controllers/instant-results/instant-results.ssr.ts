import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  InstantResultProps,
  InstantResults,
  buildInstantResults,
} from './instant-results.js';

export * from './instant-results.js';

export interface InstantResultsDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, InstantResults> {}

/**
 * Defines an `InstantResults` controller instance.
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
