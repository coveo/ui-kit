import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {
  RegularFacet,
  buildCommerceRegularFacet,
} from '../../core/facets/regular/headless-commerce-regular-facet';
import {SearchableFacetOptions} from '../../core/facets/searchable/headless-commerce-searchable-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';
import {commonOptions} from './headless-product-listing-facet-options';

/**
 * Builds a regular facet for a product listing.
 *
 * @param engine - The commerce engine.
 * @param options - The facet options.
 * @returns The regular facet.
 */
export function buildProductListingRegularFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions & SearchableFacetOptions
): RegularFacet {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceRegularFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
