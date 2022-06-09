import {CoreEngine} from '../../../app/engine';
import {search} from '../../../app/reducers';
import {firstSearchExecutedSelector} from '../../../features/search/search-selectors';
import {SearchSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export interface CoreStatus extends Controller {
  /**
   * The state of the `CoreStatus` controller.
   */
  state: CoreStatusState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `CoreStatus` controller.
 */
export interface CoreStatusState {
  /**
   * `true` if there is an error for the last executed query and `false` otherwise.
   */
  hasError: boolean;
  /**
   * Determines if a search is in progress.
   */
  isLoading: boolean;
  /**
   * Determines if there are results available for the last executed query.
   */
  hasResults: boolean;
  /**
   * Determines if a first search has been executed.
   */
  firstSearchExecuted: boolean;
}

/**
 * Creates a `CoreStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `CoreStatus` controller instance.
 * */
export function buildCoreStatus(engine: CoreEngine): CoreStatus {
  if (!loadSearchStateReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine.state;

  return {
    ...controller,

    get state() {
      const state = getState();

      return {
        hasError: state.search.error !== null,
        isLoading: state.search.isLoading,
        hasResults: !!state.search.results.length,
        firstSearchExecuted: firstSearchExecutedSelector(state),
      };
    },
  };
}

function loadSearchStateReducers(
  engine: CoreEngine
): engine is CoreEngine<SearchSection> {
  engine.addReducers({search});
  return true;
}
