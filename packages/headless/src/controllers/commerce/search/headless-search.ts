import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ChildProduct, Product} from '../../../api/commerce/common/product';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {stateKey} from '../../../app/state-key';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {
  pagePrincipalSelector,
  perPagePrincipalSelector,
  totalEntriesPrincipalSelector,
} from '../../../features/commerce/pagination/pagination-selectors';
import {searchSerializer} from '../../../features/commerce/parameters/parameters-serializer';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice';
import {restoreSearchParameters} from '../../../features/commerce/search-parameters/search-parameters-actions';
import {searchParametersDefinition} from '../../../features/commerce/search-parameters/search-parameters-schema';
import {
  executeSearch,
  fetchMoreProducts,
  promoteChildToParent,
} from '../../../features/commerce/search/search-actions';
import {
  activeParametersSelector,
  enrichedParametersSelector,
  enrichedSummarySelector,
  errorSelector,
  isLoadingSelector,
  numberOfProductsSelector,
  requestIdSelector,
  responseIdSelector,
} from '../../../features/commerce/search/search-selectors';
import {commerceSearchReducer as commerceSearch} from '../../../features/commerce/search/search-slice';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {
  buildSearchSubControllers,
  SearchSubControllers,
} from '../core/sub-controller/headless-sub-controller';
import {
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from './facets/headless-search-facet-options';

/**
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
   * E.g., if a product has children (such as color variations), you can call this method when the user selects a child
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
 *
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
    enrichParameters: enrichedParametersSelector,
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
