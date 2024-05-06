import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {
  NumericFacet,
  buildCommerceNumericFacet,
} from '../../core/facets/numeric/headless-commerce-numeric-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';
import {commonOptions} from './headless-product-listing-facet-options';

/**
 * Builds a numeric facet for a product listing.
 *
 * @param engine - The commerce engine.
 * @param options - The facet options.
 * @returns The built numeric facet.
 */
export function buildProductListingNumericFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): NumericFacet {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceNumericFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
