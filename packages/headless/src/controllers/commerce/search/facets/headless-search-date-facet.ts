import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {
  DateFacet,
  buildCommerceDateFacet,
} from '../../core/facets/date/headless-commerce-date-facet';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';
import {commonOptions} from './headless-search-facet-options';

/**
 * Builds a search date facet.
 *
 * @param engine - The commerce engine.
 * @param options - The commerce facet options.
 * @returns The built date facet.
 */
export function buildSearchDateFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): DateFacet {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceDateFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
