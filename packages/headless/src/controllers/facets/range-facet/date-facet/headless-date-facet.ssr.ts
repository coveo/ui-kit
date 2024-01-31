import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common';
import {DateFacet, DateFacetProps, buildDateFacet} from './headless-date-facet';

export * from './headless-date-facet';

export {buildDateRange} from './headless-date-facet';

/**
 * Defines a `DateFacet` controller instance.
 *
 * @param props - The configurable `DateFacet` properties.
 * @returns The `DateFacet` controller definition.
 * */
export function defineDateFacet(
  props: DateFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, DateFacet> {
  return {
    build: (engine) => buildDateFacet(engine, props),
  };
}
