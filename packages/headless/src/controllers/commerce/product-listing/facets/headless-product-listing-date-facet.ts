import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {
  CommerceDateFacet,
  buildCommerceDateFacet,
} from '../../facets/core/date/headless-commerce-date-facet';
import {CommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';
import {commonOptions} from './headless-product-listing-facet-options';

export function buildProductListingDateFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): CommerceDateFacet {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceDateFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
