import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {productListingSerializer} from '../../../../features/commerce/search-parameters/search-parameter-serializer';
import {loadReducerError} from '../../../../utils/errors';
import {
  UrlManager,
  type UrlManagerProps,
} from '../../../url-manager/headless-url-manager';
import {buildCoreUrlManager} from '../../core/url-manager/headless-core-url-manager';
import {buildProductListingParameterManager} from '../parameter-manager/headless-product-listing-parameter-manager';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';

/**
 * Creates a `UrlManager` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `UrlManager` properties.
 * @returns A `UrlManager` controller instance.
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
