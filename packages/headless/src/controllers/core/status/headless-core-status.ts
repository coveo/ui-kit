import {CoreEngine} from '../../../app/engine';
import {firstSearchExecutedSelector} from '../../../features/search/search-selectors';
import {searchReducer as search} from '../../../features/search/search-slice';
import {SearchSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export interface SearchStatus extends Controller {
  /**
   * The state of the `SearchStatus` controller.
   */
  state: SearchStatusState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `SearchStatus` controller.
 */
export interface SearchStatusState {
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
 * Creates a `SearchStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SearchStatus` controller instance.
 * */
export function buildCoreStatus(engine: CoreEngine): SearchStatus {
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
