import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common';
import {
  NumericFilter,
  NumericFilterProps,
  buildNumericFilter,
} from './headless-numeric-filter';

export type {
  NumericFilter,
  NumericFilterOptions,
  NumericFilterProps,
  NumericFilterRange,
  NumericFilterState,
  NumericFilterInitialState,
} from './headless-numeric-filter';

/**
 * @internal
 */
export const defineNumericFilter = (
  props: NumericFilterProps
): ControllerDefinitionWithoutProps<SearchEngine, NumericFilter> => ({
  build: (engine) => buildNumericFilter(engine, props),
});
