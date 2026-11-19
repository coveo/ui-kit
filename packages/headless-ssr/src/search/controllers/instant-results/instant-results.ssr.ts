import type {SearchEngine} from '@coveo/headless';
import {buildInstantResults, type InstantResultProps, type InstantResults} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type InstantResultOptions,
  type InstantResultProps,
  type InstantResults,
  type InstantResultsState,
} from '@coveo/headless';

export interface InstantResultsDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  InstantResults
> {}

/**
 * Defines an `InstantResults` controller instance.
 * @group Definers
 *
 * @param props - The configurable `InstantResults` properties.
 * @returns The `InstantResults` controller definition.
 * */
export function defineInstantResults(props: InstantResultProps): InstantResultsDefinition {
  return {
    build: (engine) => buildInstantResults(engine, props),
  };
}
