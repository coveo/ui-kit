import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {Sort, SortProps, buildSort} from './headless-sort';

export * from './headless-sort';

/**
 * @alpha
 */
export const defineSort = (
  props?: SortProps
): ControllerDefinitionWithoutProps<SearchEngine, Sort> => ({
  build: (engine) => buildSort(engine, props),
});
