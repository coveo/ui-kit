import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {stateKey} from '../../../app/state-key';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {
  fetchProductListing,
  fetchMoreProducts,
  promoteChildToParent,
} from '../../../features/commerce/product-listing/product-listing-actions';
import {
  requestIdSelector,
  responseIdSelector,
} from '../../../features/commerce/product-listing/product-listing-selectors';
import {productListingV2Reducer as productListing} from '../../../features/commerce/product-listing/product-listing-slice';
import {productListingSerializer} from '../../../features/commerce/search-parameters/search-parameter-serializer';
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
import {buildProductListingParameterManager} from './parameter-manager/headless-product-listing-parameter-manager';

/**
 * The `ProductListing` controller exposes a method for retrieving product listing content in a commerce interface.
 */
export interface ProductListing
  extends Controller,
    SearchAndListingSubControllers {
  /**
   * Fetches the product listing.
   */
  refresh(): void;

  /**
   * Finds the specified parent product and the specified child product of that parent, and makes that child the new
   * parent. The `children` and `totalNumberOfChildren` properties of the original parent are preserved in the new
   * parent.
   *
   * This method is useful when leveraging the product grouping feature to allow users to select nested products.
   *
   * E.g., if a product has children (such as color variations), you can call this method when the user selects a child
   * to make that child the new parent product, and re-render the product as such in the storefront.
   *
   * **Note:** In the controller state, a product that has children will always include itself as its own child so that
   * it can be rendered as a nested product, and restored as the parent product through this method as needed.
   *
   * @param childPermanentId The permanentid of the child product that will become the new parent.
   * @param parentPermanentId The permanentid of the current parent product of the child product to promote.
   */
  promoteChildToParent(
    childPermanentId: string,
    parentPermanentId: string
  ): void;

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
    parameterManagerBuilder: buildProductListingParameterManager,
    serializer: productListingSerializer,
  });

  return {
    ...controller,
    ...subControllers,

    promoteChildToParent(childPermanentId, parentPermanentId) {
      dispatch(promoteChildToParent({childPermanentId, parentPermanentId}));
    },

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
