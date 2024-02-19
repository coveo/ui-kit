import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common';
import {
  NumericFacet,
  NumericFacetProps,
  buildNumericFacet,
} from './headless-numeric-facet';

export * from './headless-numeric-facet';

export {buildNumericRange} from './headless-numeric-facet';

export interface NumericFacetDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, NumericFacet> {}

/**
 * Defines a `NumericFacet` controller instance.
 *
 * @param props - The configurable `NumericFacet` properties.
 * @returns The `NumericFacet` controller definition.
 * */
export function defineNumericFacet(
  props: NumericFacetProps
): NumericFacetDefinition {
  return {
    build: (engine) => buildNumericFacet(engine, props),
  };
}
