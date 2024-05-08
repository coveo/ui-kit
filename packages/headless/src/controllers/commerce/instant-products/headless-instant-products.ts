import {NumberValue, Schema} from '@coveo/bueno';
import {SerializedError} from '@reduxjs/toolkit';
import {CommerceAPIErrorResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../app/state-key';
import {
  clearExpiredProducts,
  registerInstantProducts,
  updateInstantProductsQuery,
} from '../../../features/commerce/instant-products/instant-products-actions';
import {instantProductsReducer} from '../../../features/commerce/instant-products/instant-products-slice';
import {fetchInstantProducts} from '../../../features/commerce/search/search-actions';
import {hasExpired} from '../../../features/instant-items/instant-items-state';
import {InstantProductsSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {randomID} from '../../../utils/utils';
import {nonEmptyString, validateOptions} from '../../../utils/validate-payload';
import {
  Controller,
  buildController,
} from '../../controller/headless-controller';

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
   * The state of the `InstantProducts` controller.
   */
  state: InstantProductsState;
}

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
}

/**
 * Creates an `InstantProducts` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `InstantProducts` properties.
 * @returns An `InstantProducts` controller instance.
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

    get state() {
      const query = getQuery();
      const cached = getCached(query);
      return {
        query,
        isLoading: cached?.isLoading || false,
        error: cached?.error || null,
        products: getProducts(),
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
