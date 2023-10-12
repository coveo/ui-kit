import {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common.js';
import {
  NumericFilter,
  NumericFilterProps,
  buildNumericFilter,
} from './headless-numeric-filter.js';

export * from './headless-numeric-filter.js';

/**
 * @internal
 */
export const defineNumericFilter = (
  props: NumericFilterProps
): ControllerDefinitionWithoutProps<SearchEngine, NumericFilter> => ({
  build: (engine) => buildNumericFilter(engine, props),
});
