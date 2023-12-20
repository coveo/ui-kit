import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {CommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {
  CommerceNumericFacet,
  buildCommerceNumericFacet,
} from '../../facets/core/numeric/headless-commerce-numeric-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';
import {commonOptions} from './headless-product-listing-facet-options';

export function buildProductListingNumericFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): CommerceNumericFacet {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceNumericFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
