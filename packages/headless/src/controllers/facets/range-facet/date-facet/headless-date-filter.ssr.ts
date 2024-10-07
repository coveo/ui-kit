import {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common.js';
import {
  DateFilter,
  DateFilterProps,
  buildDateFilter,
} from './headless-date-filter.js';

export * from './headless-date-filter.js';

export interface DateFilterDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, DateFilter> {}

/**
 * Defines a `DateFilter` controller instance.
 *
 * @param props - The configurable `DateFilter` properties.
 * @returns The `DateFilter` controller definition.
 * */
export function defineDateFilter(props: DateFilterProps): DateFilterDefinition {
  return {
    build: (engine) => buildDateFilter(engine, props),
  };
}
