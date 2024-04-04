import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {loadReducerError} from '../../../../utils/errors';
import {
  CommerceDateFacet,
  buildCommerceDateFacet,
} from '../../facets/core/date/headless-commerce-date-facet';
import {CommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';

export function buildProductListingDateFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): CommerceDateFacet {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceDateFacet(engine, {
    ...options,
    fetchResultsActionCreator: fetchProductListing,
  });
}
