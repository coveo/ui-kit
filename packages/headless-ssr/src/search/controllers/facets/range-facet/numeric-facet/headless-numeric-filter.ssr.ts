import type {SearchEngine} from '@coveo/headless';
import {buildNumericFilter, type NumericFilter, type NumericFilterProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../../../types/controller-definition.js';

export {
  type NumericFilter,
  type NumericFilterInitialState,
  type NumericFilterOptions,
  type NumericFilterProps,
  type NumericFilterRange,
  type NumericFilterState,
} from '@coveo/headless';

export interface NumericFilterDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  NumericFilter
> {}

/**
 * Defines a `NumericFilter` controller instance.
 * @group Definers
 *
 * @param props - The configurable `NumericFilter` properties.
 * @returns The `NumericFilter` controller definition.
 * */
export function defineNumericFilter(props: NumericFilterProps): NumericFilterDefinition {
  return {
    build: (engine) => buildNumericFilter(engine, props),
  };
}
