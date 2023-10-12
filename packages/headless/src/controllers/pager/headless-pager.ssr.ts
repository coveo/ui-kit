import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {Pager, PagerProps, buildPager} from './headless-pager.js';

export * from './headless-pager.js';

/**
 * @internal
 */
export const definePager = (
  props?: PagerProps
): ControllerDefinitionWithoutProps<SearchEngine, Pager> => ({
  build: (engine) => buildPager(engine, props),
});
