import type {SearchEngine} from '../../../../../../app/search-engine/search-engine.js';
import {
  buildDateFilter,
  type DateFilter,
  type DateFilterProps,
} from '../../../../../../controllers/facets/range-facet/date-facet/headless-date-filter.js';
import type {ControllerDefinitionWithoutProps} from '../../../../../common/types/controllers.js';

export * from '../../../../../../controllers/facets/range-facet/date-facet/headless-date-filter.js';

export interface DateFilterDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, DateFilter> {}

/**
 * Defines a `DateFilter` controller instance.
 * @group Definers
 *
 * @param props - The configurable `DateFilter` properties.
 * @returns The `DateFilter` controller definition.
 * */
export function defineDateFilter(props: DateFilterProps): DateFilterDefinition {
  return {
    build: (engine) => buildDateFilter(engine, props),
  };
}
