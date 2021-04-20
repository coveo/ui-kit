import {Engine} from '../../app/engine';
import {buildController, Controller} from '../controller/headless-controller';
import {SearchSection} from '../../state/state-sections';

/**
 * The `SearchStatus` controller provides information on the status of the search.
 */
export interface SearchStatus extends Controller {
  /**
   * The state of the SearchStatus controller.
   * */
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
export function buildSearchStatus(engine: Engine<SearchSection>): SearchStatus {
  const controller = buildController(engine);

  return {
    ...controller,

    get state() {
      return {
        hasError: engine.state.search.error !== null,
        isLoading: engine.state.search.isLoading,
        hasResults: !!engine.state.search.results.length,
        firstSearchExecuted: engine.state.search.response.searchUid !== '',
      };
    },
  };
}
