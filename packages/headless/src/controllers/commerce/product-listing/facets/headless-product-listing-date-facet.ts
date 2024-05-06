import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {
  DateFacet,
  buildCommerceDateFacet,
} from '../../core/facets/date/headless-commerce-date-facet';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';
import {commonOptions} from './headless-product-listing-facet-options';

/**
 * Builds a date facet for a product listing in a commerce engine.
 *
 * @param engine - The commerce engine.
 * @param options - The facet options.
 * @returns The built date facet.
 */
export function buildProductListingDateFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): DateFacet {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceDateFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
