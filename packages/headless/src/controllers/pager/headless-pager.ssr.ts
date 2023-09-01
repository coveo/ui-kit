import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {Pager, PagerProps, buildPager} from './headless-pager';

export type {
  PagerInitialState,
  PagerOptions,
  PagerProps,
  PagerState,
  Pager,
} from './headless-pager';

/**
 * @internal
 */
export const definePager = (
  props?: PagerProps
): ControllerDefinitionWithoutProps<SearchEngine, Pager> => ({
  build: (engine) => buildPager(engine, props),
});
