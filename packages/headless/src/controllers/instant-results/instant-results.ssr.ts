import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  InstantResultProps,
  InstantResults,
  buildInstantResults,
} from './instant-results';

export * from './instant-results';

/**
 * @alpha
 */
export const defineInstantResults = (
  props: InstantResultProps
): ControllerDefinitionWithoutProps<SearchEngine, InstantResults> => ({
  build: (engine) => buildInstantResults(engine, props),
});
