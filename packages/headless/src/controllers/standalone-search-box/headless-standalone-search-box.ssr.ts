import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  StandaloneSearchBox,
  StandaloneSearchBoxProps,
  buildStandaloneSearchBox,
} from './headless-standalone-search-box.js';

export * from './headless-standalone-search-box.js';

/**
 * @internal
 */
export const defineStandaloneSearchBox = (
  props: StandaloneSearchBoxProps
): ControllerDefinitionWithoutProps<SearchEngine, StandaloneSearchBox> => ({
  build: (engine) => buildStandaloneSearchBox(engine, props),
});
