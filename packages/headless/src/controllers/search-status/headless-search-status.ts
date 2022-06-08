import {Controller} from '../controller/headless-controller';
import {SearchSection} from '../../state/state-sections';
import {search} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  buildCoreSearchStatus,
  CoreSearchStatusState,
} from '../core/search-status/headless-core-search-status';

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
export interface SearchStatusState extends CoreSearchStatusState {}

/**
 * Creates a `SearchStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SearchStatus` controller instance.
 * */
export function buildSearchStatus(engine: SearchEngine): SearchStatus {
  if (!loadSearchStateReducers(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreSearchStatus(engine);

  return {
    ...coreController,

    get state() {
      return {
        ...coreController.state,
      };
    },
  };
}

function loadSearchStateReducers(
  engine: SearchEngine
): engine is SearchEngine<SearchSection> {
  engine.addReducers({search});
  return true;
}
