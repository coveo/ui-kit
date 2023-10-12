import {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common.js';
import {DateFacet, DateFacetProps, buildDateFacet} from './headless-date-facet.js';

export * from './headless-date-facet.js';

export {buildDateRange} from './headless-date-facet.js';

/**
 * @internal
 */
export const defineDateFacet = (
  props: DateFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, DateFacet> => ({
  build: (engine) => buildDateFacet(engine, props),
});
