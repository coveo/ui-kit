import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {productListingSerializer} from '../../../../features/commerce/parameters/parameters-serializer';
import {loadReducerError} from '../../../../utils/errors';
import {
  UrlManager,
  type UrlManagerProps,
} from '../../../url-manager/headless-url-manager';
import {buildCoreUrlManager} from '../../core/url-manager/headless-core-url-manager';
import {buildProductListingParameterManager} from '../parameter-manager/headless-product-listing-parameter-manager';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';

/**
 * Creates a `UrlManager` sub-controller.
 *
 * @param engine - The commerce engine.
 * @param props - The properties for the `UrlManager` sub-controller.
 * @returns A `UrlManager` sub-controller.
 */
export function buildProductListingUrlManager(
  engine: CommerceEngine,
  props: UrlManagerProps
): UrlManager {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCoreUrlManager(engine, {
    ...props,
    requestIdSelector: (state) => state.productListing.requestId,
    parameterManagerBuilder: buildProductListingParameterManager,
    serializer: productListingSerializer,
  });
}
