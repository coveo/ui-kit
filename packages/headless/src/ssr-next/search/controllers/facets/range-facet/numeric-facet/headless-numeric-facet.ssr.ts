import type {SearchEngine} from '../../../../../../app/search-engine/search-engine.js';
import {
  buildNumericFacet,
  type NumericFacet,
  type NumericFacetProps,
} from '../../../../../../controllers/facets/range-facet/numeric-facet/headless-numeric-facet.js';
import type {ControllerDefinitionWithoutProps} from '../../../../types/controller-definition.js';

export * from '../../../../../../controllers/facets/range-facet/numeric-facet/headless-numeric-facet.js';

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
