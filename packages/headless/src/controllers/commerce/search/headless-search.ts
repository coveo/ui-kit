import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {
  ChildProduct,
  Product,
} from '../../../api/commerce/common/product.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {configuration} from '../../../app/common-reducers.js';
import {stateKey} from '../../../app/state-key.js';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice.js';
import {
  pagePrincipalSelector,
  perPagePrincipalSelector,
  totalEntriesPrincipalSelector,
} from '../../../features/commerce/pagination/pagination-selectors.js';
import {searchSerializer} from '../../../features/commerce/parameters/parameters-serializer.js';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice.js';
import {
  executeSearch,
  fetchMoreProducts,
  promoteChildToParent,
} from '../../../features/commerce/search/search-actions.js';
import {
  activeParametersSelector,
  enrichedSummarySelector,
  errorSelector,
  isLoadingSelector,
  numberOfProductsSelector,
  requestIdSelector,
  responseIdSelector,
} from '../../../features/commerce/search/search-selectors.js';
import {commerceSearchReducer as commerceSearch} from '../../../features/commerce/search/search-slice.js';
import {restoreSearchParameters} from '../../../features/commerce/search-parameters/search-parameters-actions.js';
import {searchParametersDefinition} from '../../../features/commerce/search-parameters/search-parameters-schema.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import {
  buildSearchSubControllers,
  type SearchSubControllers,
} from '../core/sub-controller/headless-sub-controller.js';
import {
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from './facets/headless-search-facet-options.js';

/**
 * The `Search` controller lets you create a commerce search page.
 *
 * Example: [search.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/commerce/search.fn.tsx)
 *
 * @group Buildable controllers
 * @category Search
 */
export interface Search extends Controller, SearchSubControllers {
  /**
   * Executes the first search.
   */
  executeFirstSearch(): void;

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
   * A scoped and simplified part of the headless state that is relevant to the `Search` controller.
   */
  state: SearchState;
}

/**
 * @group Buildable controllers
 * @category Search
 */
export interface SearchState {
  products: Product[];
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
}

/**
 * Builds a `Search` controller for the given commerce engine.
 * @param engine - The commerce engine.
 * @returns A `Search` controller.
 *
 * @group Buildable controllers
 * @category Search
 */
export function buildSearch(engine: CommerceEngine): Search {
  if (!loadBaseSearchReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine[stateKey];
  const subControllers = buildSearchSubControllers(engine, {
    responseIdSelector,
    fetchProductsActionCreator: executeSearch,
    fetchMoreProductsActionCreator: fetchMoreProducts,
    facetResponseSelector,
    isFacetLoadingResponseSelector,
    requestIdSelector,
    serializer: searchSerializer,
    parametersDefinition: searchParametersDefinition,
    restoreActionCreator: restoreSearchParameters,
    activeParametersSelector,
    isLoadingSelector,
    errorSelector,
    pageSelector: pagePrincipalSelector,
    perPageSelector: perPagePrincipalSelector,
    totalEntriesSelector: totalEntriesPrincipalSelector,
    numberOfProductsSelector,
    enrichSummary: enrichedSummarySelector,
  });

  return {
    ...controller,
    ...subControllers,

    get state() {
      return getState().commerceSearch;
    },

    promoteChildToParent(child: ChildProduct) {
      dispatch(promoteChildToParent({child}));
    },

    executeFirstSearch() {
      const firstSearchExecuted = responseIdSelector(getState()) !== '';

      if (firstSearchExecuted) {
        return;
      }

      dispatch(executeSearch());
    },
  };
}

function loadBaseSearchReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({
    commerceContext,
    configuration,
    commerceSearch,
    commerceQuery,
  });
  return true;
}
