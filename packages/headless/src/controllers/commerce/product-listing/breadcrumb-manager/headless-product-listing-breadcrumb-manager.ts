import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {loadReducerError} from '../../../../utils/errors';
import {
  BreadcrumbManager,
  buildCoreBreadcrumbManager,
} from '../../core/breadcrumb-manager/headless-core-breadcrumb-manager';
import {facetResponseSelector} from '../facets/headless-product-listing-facet-options';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';

/**
 * Creates `ProductListingBreadcrumbManager` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `ProductListingBreadcrumbManager` controller instance.
 */
export function buildProductListingBreadcrumbManager(
  engine: CommerceEngine
): BreadcrumbManager {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCoreBreadcrumbManager(engine, {
    facetResponseSelector: facetResponseSelector,
    fetchResultsActionCreator: fetchProductListing,
  });
}
