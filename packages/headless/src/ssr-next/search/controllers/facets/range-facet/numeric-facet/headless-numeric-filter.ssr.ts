import type {SearchEngine} from '../../../../../../app/search-engine/search-engine.js';
import {
  buildNumericFilter,
  type NumericFilter,
  type NumericFilterProps,
} from '../../../../../../controllers/facets/range-facet/numeric-facet/headless-numeric-filter.js';
import type {ControllerDefinition} from '../../../../types/controller-definition.js';

export * from '../../../../../../controllers/facets/range-facet/numeric-facet/headless-numeric-filter.js';

export interface NumericFilterDefinition extends ControllerDefinition<
  SearchEngine,
  NumericFilter
> {}

/**
 * Defines a `NumericFilter` controller instance.
 * @group Definers
 *
 * @param props - The configurable `NumericFilter` properties.
 * @returns The `NumericFilter` controller definition.
 * */
export function defineNumericFilter(props: NumericFilterProps): NumericFilterDefinition {
  return {
    build: (engine) => buildNumericFilter(engine, props),
  };
}
