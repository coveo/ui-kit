import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  InstantResultProps,
  InstantResults,
  buildInstantResults,
} from './instant-results.js';

export * from './instant-results.js';

/**
 * @internal
 */
export const defineInstantResults = (
  props: InstantResultProps
): ControllerDefinitionWithoutProps<SearchEngine, InstantResults> => ({
  build: (engine) => buildInstantResults(engine, props),
});
