import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common';
import {
  DateFilter,
  DateFilterProps,
  buildDateFilter,
} from './headless-date-filter';

export * from './headless-date-filter';

/**
 * Defines a `DateFilter` controller instance.
 *
 * @param props - The configurable `DateFilter` properties.
 * @returns The `DateFilter` controller definition.
 * */
export function defineDateFilter(
  props: DateFilterProps
): ControllerDefinitionWithoutProps<SearchEngine, DateFilter> {
  return {
    build: (engine) => buildDateFilter(engine, props),
  };
}
