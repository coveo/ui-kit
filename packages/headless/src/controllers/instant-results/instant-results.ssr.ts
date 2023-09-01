import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  InstantResultProps,
  InstantResults,
  buildInstantResults,
} from './instant-results';

export type {
  InstantResults,
  InstantResultsState,
  InstantResultProps,
  InstantResultOptions,
} from './instant-results';

/**
 * @internal
 */
export const defineInstantResults = (
  props: InstantResultProps
): ControllerDefinitionWithoutProps<SearchEngine, InstantResults> => ({
  build: (engine) => buildInstantResults(engine, props),
});
