import {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common.js';
import {
  DateFilter,
  DateFilterProps,
  buildDateFilter,
} from './headless-date-filter.js';

export * from './headless-date-filter.js';

/**
 * @internal
 */
export const defineDateFilter = (
  props: DateFilterProps
): ControllerDefinitionWithoutProps<SearchEngine, DateFilter> => ({
  build: (engine) => buildDateFilter(engine, props),
});
