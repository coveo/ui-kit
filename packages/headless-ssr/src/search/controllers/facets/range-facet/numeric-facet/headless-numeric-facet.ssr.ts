import type {SearchEngine} from '@coveo/headless';
import {buildNumericFacet, type NumericFacet, type NumericFacetProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../../../types/controller-definition.js';

export {
  type NumericFacet,
  type NumericFacetOptions,
  type NumericFacetProps,
  type NumericFacetState,
  type NumericRangeOptions,
  buildNumericRange,
} from '@coveo/headless';

export interface NumericFacetDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  NumericFacet
> {}

/**
 * Defines a `NumericFacet` controller instance.
 * @group Definers
 *
 * @param props - The configurable `NumericFacet` properties.
 * @returns The `NumericFacet` controller definition.
 * */
export function defineNumericFacet(props: NumericFacetProps): NumericFacetDefinition {
  return {
    build: (engine) => buildNumericFacet(engine, props),
  };
}
