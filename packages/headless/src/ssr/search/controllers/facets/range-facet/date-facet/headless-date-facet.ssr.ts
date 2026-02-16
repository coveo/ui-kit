import type {SearchEngine} from '../../../../../../app/search-engine/search-engine.js';
import {
  buildDateFacet,
  type DateFacet,
  type DateFacetProps,
} from '../../../../../../controllers/facets/range-facet/date-facet/headless-date-facet.js';
import type {ControllerDefinitionWithoutProps} from '../../../../../common/types/controllers.js';

export * from '../../../../../../controllers/facets/range-facet/date-facet/headless-date-facet.js';

export interface DateFacetDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, DateFacet> {}

/**
 * Defines a `DateFacet` controller instance.
 * @group Definers
 *
 * @param props - The configurable `DateFacet` properties.
 * @returns The `DateFacet` controller definition.
 * */
export function defineDateFacet(props: DateFacetProps): DateFacetDefinition {
  return {
    build: (engine) => buildDateFacet(engine, props),
  };
}
