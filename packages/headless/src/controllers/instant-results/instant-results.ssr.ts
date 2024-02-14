import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  InstantResultProps,
  InstantResults,
  buildInstantResults,
} from './instant-results';

export * from './instant-results';

export interface InstantResultsDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, InstantResults> {}

/**
 * Defines a `InstantResults` controller instance.
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
