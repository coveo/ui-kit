import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common';
import {
  NumericFacet,
  NumericFacetProps,
  buildNumericFacet,
} from './headless-numeric-facet';

export * from './headless-numeric-facet';

export {buildNumericRange} from './headless-numeric-facet';

/**
 * @alpha
 */
export const defineNumericFacet = (
  props: NumericFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, NumericFacet> => ({
  build: (engine) => buildNumericFacet(engine, props),
});
