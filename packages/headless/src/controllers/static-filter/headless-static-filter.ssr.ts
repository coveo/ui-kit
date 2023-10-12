import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  StaticFilter,
  StaticFilterProps,
  buildStaticFilter,
} from './headless-static-filter.js';

export * from './headless-static-filter.js';

export {buildStaticFilterValue} from './headless-static-filter.js';

/**
 * @internal
 */
export const defineStaticFilter = (
  props: StaticFilterProps
): ControllerDefinitionWithoutProps<SearchEngine, StaticFilter> => ({
  build: (engine) => buildStaticFilter(engine, props),
});
