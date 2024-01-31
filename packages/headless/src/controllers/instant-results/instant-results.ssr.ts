import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  InstantResultProps,
  InstantResults,
  buildInstantResults,
} from './instant-results';

export * from './instant-results';

/**
 * Defines a `InstantResults` controller instance.
 *
 * @param props - The configurable `InstantResults` properties.
 * @returns The `InstantResults` controller definition.
 * */
export function defineInstantResults(
  props: InstantResultProps
): ControllerDefinitionWithoutProps<SearchEngine, InstantResults> {
  return {
    build: (engine) => buildInstantResults(engine, props),
  };
}
