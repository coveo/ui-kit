import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {stateKey} from '../../../app/state-key';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice';
import {searchSerializer} from '../../../features/commerce/search-parameters/search-parameter-serializer';
import {
  executeSearch,
  fetchMoreProducts,
  promoteChildToParent,
} from '../../../features/commerce/search/search-actions';
import {
  requestIdSelector,
  responseIdSelector,
} from '../../../features/commerce/search/search-selectors';
import {commerceSearchReducer as commerceSearch} from '../../../features/commerce/search/search-slice';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {ControllerWithPromotableChildProducts} from '../core/common';
import {
  buildSearchSubControllers,
  SearchSubControllers,
} from '../core/sub-controller/headless-sub-controller';
import {
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from './facets/headless-search-facet-options';
import {buildSearchParameterManager} from './parameter-manager/headless-search-parameter-manager';

export interface Search
  extends Controller,
    ControllerWithPromotableChildProducts,
    SearchSubControllers {
  /**
   * Executes the first search.
   */
  executeFirstSearch(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Search` controller.
   */
  state: SearchState;
}

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
    parameterManagerBuilder: buildSearchParameterManager,
    serializer: searchSerializer,
  });

  return {
    ...controller,
    ...subControllers,

    get state() {
      return getState().commerceSearch;
    },

    promoteChildToParent(childPermanentId: string, parentPermanentId: string) {
      dispatch(promoteChildToParent({childPermanentId, parentPermanentId}));
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
