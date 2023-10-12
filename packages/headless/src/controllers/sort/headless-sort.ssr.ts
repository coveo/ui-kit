import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {Sort, SortProps, buildSort} from './headless-sort.js';

export * from './headless-sort.js';

/**
 * @internal
 */
export const defineSort = (
  props?: SortProps
): ControllerDefinitionWithoutProps<SearchEngine, Sort> => ({
  build: (engine) => buildSort(engine, props),
});
