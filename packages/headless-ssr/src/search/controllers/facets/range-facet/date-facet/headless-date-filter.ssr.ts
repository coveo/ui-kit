import type {SearchEngine} from '@coveo/headless';
import {buildDateFilter, type DateFilter, type DateFilterProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../../../types/controller-definition.js';

export {
  type DateFilter,
  type DateFilterInitialState,
  type DateFilterOptions,
  type DateFilterProps,
  type DateFilterRange,
  type DateFilterState,
} from '@coveo/headless';

export interface DateFilterDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  DateFilter
> {}

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
