import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common';
import {
  DateFilter,
  DateFilterProps,
  buildDateFilter,
} from './headless-date-filter';

export * from './headless-date-filter';

/**
 * @alpha
 */
export const defineDateFilter = (
  props: DateFilterProps
): ControllerDefinitionWithoutProps<SearchEngine, DateFilter> => ({
  build: (engine) => buildDateFilter(engine, props),
});
