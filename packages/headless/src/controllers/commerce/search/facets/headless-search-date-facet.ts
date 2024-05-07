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
 * Builds a date facet for the search page.
 *
 * Commerce facets are not requested by the implementer, but rather pre-configured through the Coveo Merchandising Hub
 * (CMH). The implementer is only responsible for leveraging the facet controllers created by the
 * `headless-search-facet-generator` controller to properly render facets in their application.
 *
 * @param engine - The commerce engine.
 * @param options - The facet options.
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
