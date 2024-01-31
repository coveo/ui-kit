import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common';
import {
  NumericFilter,
  NumericFilterProps,
  buildNumericFilter,
} from './headless-numeric-filter';

export * from './headless-numeric-filter';

export interface NumericFilterDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, NumericFilter> {}

/**
 * Defines a `NumericFilter` controller instance.
 *
 * @param props - The configurable `NumericFilter` properties.
 * @returns The `NumericFilter` controller definition.
 * */
export function defineNumericFilter(
  props: NumericFilterProps
): NumericFilterDefinition {
  return {
    build: (engine) => buildNumericFilter(engine, props),
  };
}
