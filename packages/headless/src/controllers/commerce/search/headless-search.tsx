import {logInterfaceLoad, logOmniboxFromLink, logSearchFromLink} from '../../../features/analytics/analytics-actions';
import {
  StandaloneSearchBoxAnalytics
} from '../../../features/standalone-search-box-set/standalone-search-box-set-state';
import {loadReducerError} from '../../../utils/errors';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {buildController, Controller} from '../../controller/headless-controller';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {searchReducer as commerceSearch} from '../../../features/commerce/search/search-slice';
import {configuration} from '../../../app/common-reducers';
import {SearchAction} from '../../../features/analytics/analytics-utils';
import {executeSearch} from '../../../features/commerce/search/search-actions';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';

export interface Search extends Controller {
  /**
   * Executes the first search.
   *
   * @param analyticsEvent - The analytics event to log in association with the first search. If unspecified, `logInterfaceLoad` will be used.
   */
  executeFirstSearch(analyticsEvent?: SearchAction): void;

  /**
   * Executes the first search, and logs the analytics event that triggered a redirection from a standalone search box.
   *
   * @param analytics - The standalone search box analytics data.
   */
  executeFirstSearchAfterStandaloneSearchBoxRedirect(
    analytics: StandaloneSearchBoxAnalytics
  ): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Search` controller.
   */
  state: SearchState
}

export interface SearchState {
  products: ProductRecommendation[];
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

  return {
    ...controller,

    get state() {
      return getState().commerceSearch;
    },

    executeFirstSearch(analyticsEvent = logInterfaceLoad()) {
      const firstSearchExecuted = engine.state.commerceSearch.responseId !== '';

      if (firstSearchExecuted) {
        return;
      }

      const action = executeSearch(analyticsEvent);
      dispatch(action);
    },

    executeFirstSearchAfterStandaloneSearchBoxRedirect(
      analytics: StandaloneSearchBoxAnalytics
    ) {
      const {cause, metadata} = analytics;
      const event =
        metadata && cause === 'omniboxFromLink'
          ? logOmniboxFromLink(metadata)
          : logSearchFromLink();

      this.executeFirstSearch(event);
    },
  };
}

function loadBaseSearchReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({commerceContext, configuration, commerceSearch});
  return true;
}
