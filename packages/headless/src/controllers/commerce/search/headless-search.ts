import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {LegacySearchAction} from '../../../features/analytics/analytics-utils';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice';
import {executeSearch} from '../../../features/commerce/search/search-actions';
import {responseIdSelector} from '../../../features/commerce/search/search-selectors';
import {commerceSearchReducer as commerceSearch} from '../../../features/commerce/search/search-slice';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {
  buildSolutionTypeSubControllers,
  SolutionTypeSubControllers,
} from '../core/sub-controller/headless-sub-controller';

export interface Search extends Controller, SolutionTypeSubControllers {
  /**
   * Executes the first search.
   */
  executeFirstSearch(analyticsEvent?: LegacySearchAction): void;

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

export function buildSearch(engine: CommerceEngine): Search {
  if (!loadBaseSearchReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;
  const subControllers = buildSolutionTypeSubControllers(engine, {
    responseIdSelector,
    fetchResultsActionCreator: executeSearch,
  });

  return {
    ...controller,
    ...subControllers,

    get state() {
      return getState().commerceSearch;
    },

    // eslint-disable-next-line @cspell/spellchecker
    // TODO CAPI-244: Handle analytics
    executeFirstSearch() {
      const firstSearchExecuted = responseIdSelector(engine.state) !== '';

      if (firstSearchExecuted) {
        return;
      }

      dispatch(executeSearch({sliceId: 'default'}));
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
