import {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common.js';
import {
  NumericFacet,
  NumericFacetProps,
  buildNumericFacet,
} from './headless-numeric-facet.js';

export * from './headless-numeric-facet.js';

export {buildNumericRange} from './headless-numeric-facet.js';

/**
 * @internal
 */
export const defineNumericFacet = (
  props: NumericFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, NumericFacet> => ({
  build: (engine) => buildNumericFacet(engine, props),
});
