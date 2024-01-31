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
 * Defines a `NumericFacet` controller instance.
 *
 * @param props - The configurable `NumericFacet` properties.
 * @returns The `NumericFacet` controller definition.
 * */
export function defineNumericFacet(
  props: NumericFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, NumericFacet> {
  return {
    build: (engine) => buildNumericFacet(engine, props),
  };
}
