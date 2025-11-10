import {NumberValue, Schema} from '@coveo/bueno';
import type {SerializedError} from '@reduxjs/toolkit';
import type {CommerceAPIErrorResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {
  ChildProduct,
  Product,
} from '../../../api/commerce/common/product.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {
  clearExpiredProducts,
  promoteChildToParent,
  registerInstantProducts,
  updateInstantProductsQuery,
} from '../../../features/commerce/instant-products/instant-products-actions.js';
import {instantProductsReducer} from '../../../features/commerce/instant-products/instant-products-slice.js';
import {fetchInstantProducts} from '../../../features/commerce/search/search-actions.js';
import {hasExpired} from '../../../features/instant-items/instant-items-state.js';
import type {InstantProductsSection} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {randomID} from '../../../utils/utils.js';
import {
  nonEmptyString,
  validateOptions,
} from '../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import {
  buildCoreInteractiveProduct,
  type InteractiveProduct,
  type InteractiveProductProps,
} from '../core/interactive-product/headless-core-interactive-product.js';

export interface InstantProductsOptions {
  /**
   * A unique identifier for the search box.
   */
  searchBoxId?: string;
  /**
   * Number in milliseconds that cached products will be valid for. Defaults to 1 minute. Set to 0 so that products never expire.
   */
  cacheTimeout?: number;
}

const instantProductsOptionDefinitions = {
  searchBoxId: nonEmptyString,
  cacheTimeout: new NumberValue(),
};

const instantProductsOptionsSchema = new Schema<
  Required<InstantProductsOptions>
>(instantProductsOptionDefinitions);

export interface InstantProductsProps {
  options: InstantProductsOptions;
}

/**
 * The `InstantProducts` controller allows the end user to manage instant products queries.
 *
 * @group Buildable controllers
 * @category InstantProducts
 */
export interface InstantProducts extends Controller {
  /**
   * Updates the specified query and shows instant products for it.
   *
   * @param query - The query to get instant products for. For more precise instant products, query suggestions are recommended.
   */
  updateQuery(query: string): void;
  /**
   * Clears all expired instant products queries.
   */
  clearExpired(): void;
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
   * Creates an `InteractiveProduct` sub-controller.
   * @param props - The properties for the `InteractiveProduct` sub-controller.
   * @returns An `InteractiveProduct` sub-controller.
   */
  interactiveProduct(props: InteractiveProductProps): InteractiveProduct;

  /**
   * The state of the `InstantProducts` controller.
   */
  state: InstantProductsState;
}

/**
 * The state of the `InstantProducts` controller.
 *
 * @group Buildable controllers
 * @category InstantProducts
 */
export interface InstantProductsState {
  /**
   * The current query for instant products.
   */
  query: string;
  /**
   * The instant products for the current query.
   */
  products: Product[];
  /**
   * Determines if a search is in progress for the current query.
   */
  isLoading: boolean;
  /**
   * An error returned when executing an instant products request, if any. This is `null` otherwise.
   */
  error: CommerceAPIErrorResponse | SerializedError | null;
  /**
   * The total number of products that match the current query.
   */
  totalCount: number;
}

/**
 * Creates an `InstantProducts` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `InstantProducts` properties.
 * @returns An `InstantProducts` controller instance.
 *
 * @group Buildable controllers
 * @category InstantProducts
 */
export function buildInstantProducts(
  engine: CommerceEngine,
  props: InstantProductsProps
): InstantProducts {
  if (!loadInstantProductsReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine[stateKey];

  const options: Required<InstantProductsOptions> = {
    searchBoxId: props.options.searchBoxId || randomID('instant-products-'),
    cacheTimeout: props.options.cacheTimeout || 6e4,
  };

  validateOptions(
    engine,
    instantProductsOptionsSchema,
    options,
    'buildInstantProducts'
  );

  const searchBoxId = options.searchBoxId;
  dispatch(registerInstantProducts({id: searchBoxId}));

  const getStateForSearchBox = () => getState().instantProducts[searchBoxId];

  const getCached = (q: string) => getStateForSearchBox().cache[q];
  const getQuery = () => getStateForSearchBox().q;
  const getProducts = () => {
    const cached = getCached(getQuery());
    if (!cached) {
      return [];
    }
    if (cached.isLoading) {
      return [];
    }
    return cached.products;
  };

  return {
    ...controller,

    updateQuery(query: string) {
      if (!query) {
        return;
      }
      const cached = getCached(query);
      if (
        !cached ||
        (!cached.isLoading && (cached.error || hasExpired(cached)))
      ) {
        dispatch(
          fetchInstantProducts({
            id: searchBoxId,
            q: query,
            cacheTimeout: options.cacheTimeout,
          })
        );
      }
      dispatch(updateInstantProductsQuery({id: searchBoxId, query}));
    },

    clearExpired() {
      dispatch(
        clearExpiredProducts({
          id: searchBoxId,
        })
      );
    },

    promoteChildToParent(child: ChildProduct) {
      dispatch(
        promoteChildToParent({
          child,
          id: searchBoxId,
          query: getQuery(),
        })
      );
    },

    interactiveProduct(props: InteractiveProductProps) {
      return buildCoreInteractiveProduct(engine, {
        ...props,
        responseIdSelector: () =>
          getStateForSearchBox().cache[getQuery()].searchUid,
      });
    },

    get state() {
      const query = getQuery();
      const cached = getCached(query);
      return {
        query,
        isLoading: cached?.isLoading || false,
        error: cached?.error || null,
        products: getProducts(),
        totalCount: cached?.totalCountFiltered || 0,
      };
    },
  };
}

function loadInstantProductsReducers(
  engine: CommerceEngine
): engine is CommerceEngine<InstantProductsSection> {
  engine.addReducers({instantProducts: instantProductsReducer});
  return true;
}
