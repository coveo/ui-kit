import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  StandaloneSearchBox,
  StandaloneSearchBoxProps,
  buildStandaloneSearchBox,
} from './headless-standalone-search-box';

export * from './headless-standalone-search-box';

/**
 * @alpha
 */
export const defineStandaloneSearchBox = (
  props: StandaloneSearchBoxProps
): ControllerDefinitionWithoutProps<SearchEngine, StandaloneSearchBox> => ({
  build: (engine) => buildStandaloneSearchBox(engine, props),
});
