import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {
  CommerceRegularFacet,
  buildCommerceRegularFacet,
} from '../../core/facets/regular/headless-commerce-regular-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';
import {commonOptions} from './headless-product-listing-facet-options';

export function buildProductListingRegularFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): CommerceRegularFacet {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceRegularFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
