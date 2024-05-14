import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {firstSearchExecutedSelector} from '../../../features/commerce/product-listing/product-listing-selectors';
import {SearchStatus} from '../../core/status/headless-core-status';
import {buildCoreStatus} from '../core/status/headless-core-status';

/**
 * Creates a `ProductListingStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `ProductListingStatus` controller instance.
 * @internal
 * */
export function buildProductListingStatus(
  engine: CommerceEngine
): SearchStatus {
  return buildCoreStatus(engine, {
    firstSearchExecutedSelector,
  });
}
