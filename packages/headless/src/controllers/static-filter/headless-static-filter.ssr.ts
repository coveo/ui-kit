import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  StaticFilter,
  StaticFilterProps,
  buildStaticFilter,
} from './headless-static-filter';

export * from './headless-static-filter';

export {buildStaticFilterValue} from './headless-static-filter';

/**
 * @alpha
 */
export const defineStaticFilter = (
  props: StaticFilterProps
): ControllerDefinitionWithoutProps<SearchEngine, StaticFilter> => ({
  build: (engine) => buildStaticFilter(engine, props),
});
