import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common';
import {
  NumericFilter,
  NumericFilterProps,
  buildNumericFilter,
} from './headless-numeric-filter';

export * from './headless-numeric-filter';

/**
 * @alpha
 */
export const defineNumericFilter = (
  props: NumericFilterProps
): ControllerDefinitionWithoutProps<SearchEngine, NumericFilter> => ({
  build: (engine) => buildNumericFilter(engine, props),
});
