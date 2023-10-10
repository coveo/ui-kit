import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {SearchBox, SearchBoxProps, buildSearchBox} from './headless-search-box';

export * from './headless-search-box';

/**
 * @internal
 */
export const defineSearchBox = (
  props?: SearchBoxProps
): ControllerDefinitionWithoutProps<SearchEngine, SearchBox> => ({
  build: (engine) => buildSearchBox(engine, props),
});
