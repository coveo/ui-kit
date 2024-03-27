import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {
  BreadcrumbManager,
  buildCoreBreadcrumbManager,
} from '../../core/breadcrumb-manager/headless-core-breadcrumb-manager';
import {facetResponseSelector} from './headless-product-listing-facet-options';

/**
 * Creates `ProductListingBreadcrumbManager` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `ProductListingBreadcrumbManager` controller instance.
 */
export function buildProductListingBreadcrumbManager(
  engine: CommerceEngine
): BreadcrumbManager {
  return buildCoreBreadcrumbManager(engine, {
    facetResponseSelector: facetResponseSelector,
    fetchResultsActionCreator: fetchProductListing,
  });
}
