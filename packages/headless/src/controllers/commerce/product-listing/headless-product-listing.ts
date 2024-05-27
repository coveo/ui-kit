import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {stateKey} from '../../../app/state-key';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {Parameters} from '../../../features/commerce/parameters/parameters-actions';
import {parametersDefinition} from '../../../features/commerce/parameters/parameters-schema';
import {
  activeParametersSelector,
  enrichedParametersSelector,
} from '../../../features/commerce/parameters/parameters-selectors';
import {productListingSerializer} from '../../../features/commerce/parameters/parameters-serializer';
import {restoreProductListingParameters} from '../../../features/commerce/product-listing-parameters/product-listing-parameter-actions';
import {
  fetchProductListing,
  fetchMoreProducts,
} from '../../../features/commerce/product-listing/product-listing-actions';
import {
  requestIdSelector,
  responseIdSelector,
} from '../../../features/commerce/product-listing/product-listing-selectors';
import {productListingV2Reducer as productListing} from '../../../features/commerce/product-listing/product-listing-slice';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {
  buildProductListingSubControllers,
  SearchAndListingSubControllers,
} from '../core/sub-controller/headless-sub-controller';
import {
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from './facets/headless-product-listing-facet-options';

/**
 * The `ProductListing` controller exposes a method for retrieving product listing content in a commerce interface.
 */
export interface ProductListing
  extends Controller,
    SearchAndListingSubControllers<Parameters> {
  /**
   * Fetches the product listing.
   */
  refresh(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `ProductListing` controller.
   */
  state: ProductListingState;
}

export interface ProductListingState {
  products: Product[];
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
}

/**
 * Creates a `ProductListing` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `ProductListing` controller instance.
 */
export function buildProductListing(engine: CommerceEngine): ProductListing {
  if (!loadBaseProductListingReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine[stateKey];
  const subControllers = buildProductListingSubControllers(engine, {
    responseIdSelector,
    fetchProductsActionCreator: fetchProductListing,
    fetchMoreProductsActionCreator: fetchMoreProducts,
    facetResponseSelector,
    isFacetLoadingResponseSelector,
    requestIdSelector,
    serializer: productListingSerializer,
    parametersDefinition,
    activeParametersSelector,
    restoreActionCreator: restoreProductListingParameters,
    enrichParameters: enrichedParametersSelector,
  });

  return {
    ...controller,
    ...subControllers,

    get state() {
      const {products, error, isLoading, responseId} =
        getState().productListing;
      return {
        products,
        error,
        isLoading,
        responseId,
      };
    },

    refresh: () => dispatch(fetchProductListing()),
  };
}

function loadBaseProductListingReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({productListing, commerceContext, configuration});
  return true;
}
