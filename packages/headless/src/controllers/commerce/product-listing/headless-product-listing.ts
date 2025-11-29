import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {
  ChildProduct,
  Product,
} from '../../../api/commerce/common/product.js';
import type {Result} from '../../../api/commerce/common/result.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {configuration} from '../../../app/common-reducers.js';
import {stateKey} from '../../../app/state-key.js';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice.js';
import {
  pagePrincipalSelector,
  perPagePrincipalSelector,
  totalEntriesPrincipalSelector,
} from '../../../features/commerce/pagination/pagination-selectors.js';
import type {Parameters} from '../../../features/commerce/parameters/parameters-actions.js';
import {parametersDefinition} from '../../../features/commerce/parameters/parameters-schema.js';
import {activeParametersSelector} from '../../../features/commerce/parameters/parameters-selectors.js';
import {productListingSerializer} from '../../../features/commerce/parameters/parameters-serializer.js';
import type {FetchProductListingPayload} from '../../../features/commerce/product-listing/product-listing-actions.js';
import {
  fetchMoreProducts,
  fetchProductListing,
  promoteChildToParent,
} from '../../../features/commerce/product-listing/product-listing-actions.js';
import {
  errorSelector,
  isLoadingSelector,
  numberOfProductsSelector,
  requestIdSelector,
  responseIdSelector,
} from '../../../features/commerce/product-listing/product-listing-selectors.js';
import {productListingReducer as productListing} from '../../../features/commerce/product-listing/product-listing-slice.js';
import {restoreProductListingParameters} from '../../../features/commerce/product-listing-parameters/product-listing-parameters-actions.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import {
  buildProductListingSubControllers,
  type SearchAndListingSubControllers,
} from '../core/sub-controller/headless-sub-controller.js';
import {
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from './facets/headless-product-listing-facet-options.js';
import type {ProductListingSummaryState} from './summary/headless-product-listing-summary.js';

/**
 * The `ProductListing` controller exposes a method for retrieving product listing content in a commerce interface.
 *
 * Example: [product-listing.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/commerce/product-listing.fn.tsx)
 *
 * @group Buildable controllers
 * @category ProductListing
 */
export interface ProductListing
  extends Controller,
    SearchAndListingSubControllers<Parameters, ProductListingSummaryState> {
  /**
   * Fetches the product listing.
   */
  refresh(): void;

  /**
   * Executes the first request if it has not been executed yet.
   */
  executeFirstRequest(): void;

  /**
   * Finds the specified parent product and the specified child product of that parent, and makes that child the new
   * parent. The `children` and `totalNumberOfChildren` properties of the original parent are preserved in the new
   * parent.
   *
   * This method is useful when leveraging the product grouping feature to allow users to select nested products.
   *
   * For example, if a product has children (such as color variations), you can call this method when the user selects a child
   * to make that child the new parent product, and re-render the product as such in the storefront.
   *
   * **Note:** In the controller state, a product that has children will always include itself as its own child so that
   * it can be rendered as a nested product, and restored as the parent product through this method as needed.
   *
   * @param child The child product that will become the new parent.
   */
  promoteChildToParent(child: ChildProduct): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `ProductListing` controller.
   */
  state: ProductListingState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `ProductListing` controller.
 *
 * @group Buildable controllers
 * @category ProductListing
 */
export interface ProductListingState {
  products: Product[];
  results: Result[];
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
}

/**
 * Options for configuring the `ProductListing` controller.
 * @group Buildable controllers
 * @category ProductListing
 */
export interface ProductListingOptions extends FetchProductListingPayload {}

/**
 * Creates a `ProductListing` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param options - The configurable `ProductListing` controller options.
 * @returns A `ProductListing` controller instance.
 *
 * @group Buildable controllers
 * @category ProductListing
 */
export function buildProductListing(
  engine: CommerceEngine,
  {enableResults = false}: ProductListingOptions = {
    enableResults: false,
  }
): ProductListing {
  if (!loadBaseProductListingReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine[stateKey];

  const subControllers = buildProductListingSubControllers(engine, {
    responseIdSelector,
    fetchProductsActionCreator: () => fetchProductListing({enableResults}),
    fetchMoreProductsActionCreator: () => fetchMoreProducts({enableResults}),
    facetResponseSelector,
    isFacetLoadingResponseSelector,
    requestIdSelector,
    serializer: productListingSerializer,
    parametersDefinition,
    activeParametersSelector,
    restoreActionCreator: restoreProductListingParameters,
    isLoadingSelector,
    errorSelector,
    pageSelector: pagePrincipalSelector,
    perPageSelector: perPagePrincipalSelector,
    totalEntriesSelector: totalEntriesPrincipalSelector,
    numberOfProductsSelector,
  });

  return {
    ...controller,
    ...subControllers,

    get state() {
      const {products, results, error, isLoading, responseId} =
        getState().productListing;
      return {
        products,
        results,
        error,
        isLoading,
        responseId,
      };
    },

    promoteChildToParent(child: ChildProduct) {
      dispatch(promoteChildToParent({child}));
    },

    refresh: () => dispatch(fetchProductListing({enableResults})),

    executeFirstRequest() {
      const firstRequestExecuted = responseIdSelector(getState()) !== '';

      if (firstRequestExecuted) {
        return;
      }

      dispatch(fetchProductListing({enableResults}));
    },
  };
}

function loadBaseProductListingReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({productListing, commerceContext, configuration});
  return true;
}
