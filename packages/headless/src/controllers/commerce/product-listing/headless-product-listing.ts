import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {fetchProductListing} from '../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../features/commerce/product-listing/product-listing-slice';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {Pagination} from '../core/pagination/headless-core-commerce-pagination';
import {Sort, SortProps} from '../core/sort/headless-core-commerce-sort';
import {
  buildProductListingFacetGenerator,
  ProductListingFacetGenerator,
} from './facets/headless-product-listing-facet-generator';
import {buildProductListingPagination} from './pagination/headless-product-listing-pagination';
import {buildProductListingSort} from './sort/headless-product-listing-sort';

// Adding a controller requires changing the controller's interface.
interface SubControllers {
  pagination: Pagination;
  sort: Sort;
  facetGenerator: ProductListingFacetGenerator;
}

/**
 * The `ProductListing` controller exposes a method for retrieving product listing content in a commerce interface.
 */
export interface ProductListing extends Controller, SubControllers {
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
  products: ProductRecommendation[];
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
}

export interface ProductListingProps {
  options?: {
    sort?: SortProps;
  };
}

export type ProductListingControllerState = ProductListing['state'];

/**
 * Creates a `ProductListing` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The product listing options.
 * @returns A `ProductListing` controller instance.
 */
// Adding a controller requires changing the controller's props. How do we handle a new controller that *requires* parameters without making a breaking change?
export function buildProductListing(
  engine: CommerceEngine,
  props?: ProductListingProps
): ProductListing {
  if (!loadBaseProductListingReducers(engine)) {
    throw loadReducerError;
  }

  const subControllers = {
    pagination: buildProductListingPagination(engine),
    sort: buildProductListingSort(engine, props?.options?.sort),
    facetGenerator: buildProductListingFacetGenerator(engine),
    // Skipping this controller demonstrates a downside with this approach: we can't initialize a controller without
    // initializing all of its sub-controllers. This is a problem because we sometimes do want to initialize a
    // sub-controller later.
    // parameterManager: buildProductListingParameterManager(engine, props?.options?.parameterManager)
    // This is a similar issue to the one described in the previous comment.
    // interactiveResults: buildInteractiveResult(engine, props?.options?.interactiveResult),
  };

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

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
