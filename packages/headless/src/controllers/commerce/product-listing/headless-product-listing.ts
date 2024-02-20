import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {fetchProductListing} from '../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../features/commerce/product-listing/product-listing-slice';
import {ProductListingParameters} from '../../../features/commerce/search-parameters/search-parameter-actions';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {
  UrlManager,
  UrlManagerProps,
} from '../../url-manager/headless-url-manager';
import {Pagination} from '../core/pagination/headless-core-commerce-pagination';
import {
  ParameterManager,
  ParameterManagerProps,
} from '../core/parameter-manager/headless-core-parameter-manager';
import {Sort, SortProps} from '../core/sort/headless-core-commerce-sort';
import {
  buildProductListingFacetGenerator,
  ProductListingFacetGenerator,
} from './facets/headless-product-listing-facet-generator';
import {buildProductListingPagination} from './pagination/headless-product-listing-pagination';
import {buildProductListingParameterManager} from './parameter-manager/headless-product-listing-parameter-manager';
import {
  buildInteractiveResult,
  InteractiveResult,
  InteractiveResultProps,
} from './result-list/headless-product-listing-interactive-result';
import {buildProductListingSort} from './sort/headless-product-listing-sort';
import {buildProductListingUrlManager} from './url-manager/headless-product-listing-url-manager';

// Adding a controller requires changing the controller's interface.
interface SubControllerBuilders {
  buildPagination: () => Pagination;
  buildSort: (sortProps?: SortProps) => Sort;
  buildFacetGenerator: () => ProductListingFacetGenerator;
  buildUrlManager: (urlManagerProps: UrlManagerProps) => UrlManager;
  buildParameterManager: (
    parameterManagerProps: ParameterManagerProps<ProductListingParameters>
  ) => ParameterManager<ProductListingParameters>;
  buildInteractiveResult: (
    interactiveResultProps: InteractiveResultProps
  ) => InteractiveResult;
}

/**
 * The `ProductListing` controller exposes a method for retrieving product listing content in a commerce interface.
 */
export interface ProductListing extends Controller, SubControllerBuilders {
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

export type ProductListingControllerState = ProductListing['state'];

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

  const subControllerBuilders = {
    buildPagination: () => buildProductListingPagination(engine),
    buildSort: (sortProps: SortProps = {}) =>
      buildProductListingSort(engine, sortProps),
    buildFacetGenerator: () => buildProductListingFacetGenerator(engine),
    buildUrlManager: (urlManagerProps: UrlManagerProps) =>
      buildProductListingUrlManager(engine, urlManagerProps),
    buildParameterManager: (
      parameterManagerProps: ParameterManagerProps<ProductListingParameters>
    ) => buildProductListingParameterManager(engine, parameterManagerProps),
    buildInteractiveResult: (interactiveResultProps: InteractiveResultProps) =>
      buildInteractiveResult(engine, interactiveResultProps),
  };

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  return {
    ...controller,

    ...subControllerBuilders,

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
