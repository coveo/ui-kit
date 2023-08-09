import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {Controller} from '../../controller/headless-controller';
import {
  SearchBox,
  SearchBoxProps,
  buildSearchBox,
} from '../../search-box/headless-search-box';

export type {
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  SearchBox,
} from '../../search-box/headless-search-box';

/**
 * @internal
 */
export type SearchBoxMethods = Omit<SearchBox, keyof Controller>;

/**
 * @internal
 */
export const defineSearchBox = (
  props?: SearchBoxProps
): ControllerDefinitionWithoutProps<SearchEngine, SearchBox> => ({
  build: (engine) => buildSearchBox(engine, props),
});
