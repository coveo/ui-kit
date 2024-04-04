import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common';
import {DateFacet, DateFacetProps, buildDateFacet} from './headless-date-facet';

export * from './headless-date-facet';

export {buildDateRange} from './headless-date-facet';

/**
 * @alpha
 */
export const defineDateFacet = (
  props: DateFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, DateFacet> => ({
  build: (engine) => buildDateFacet(engine, props),
});
