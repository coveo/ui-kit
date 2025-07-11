import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common.js';
import {
  buildNumericFacet,
  type NumericFacet,
  type NumericFacetProps,
} from './headless-numeric-facet.js';

export * from './headless-numeric-facet.js';

export {buildNumericRange} from './headless-numeric-facet.js';

export interface NumericFacetDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, NumericFacet> {}

/**
 * Defines a `NumericFacet` controller instance.
 * @group Definers
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
