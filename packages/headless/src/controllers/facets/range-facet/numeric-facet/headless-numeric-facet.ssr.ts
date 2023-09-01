import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common';
import {
  NumericFacet,
  NumericFacetProps,
  buildNumericFacet,
} from './headless-numeric-facet';

export type {
  NumericRangeOptions,
  NumericRangeRequest,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericFacet,
} from './headless-numeric-facet';

export {buildNumericRange} from './headless-numeric-facet';

/**
 * @internal
 */
export const defineNumericFacet = (
  props: NumericFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, NumericFacet> => ({
  build: (engine) => buildNumericFacet(engine, props),
});
