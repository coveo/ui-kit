import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common.js';
import {
  buildDateFilter,
  type DateFilter,
  type DateFilterProps,
} from './headless-date-filter.js';

export * from './headless-date-filter.js';

export interface DateFilterDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, DateFilter> {}

/**
 * Defines a `DateFilter` controller instance.
 * @group Definers
 *
 * @param props - The configurable `DateFilter` properties.
 * @returns The `DateFilter` controller definition.
 * */
export function defineDateFilter(props: DateFilterProps): DateFilterDefinition {
  return {
    build: (engine) => buildDateFilter(engine, props),
  };
}
