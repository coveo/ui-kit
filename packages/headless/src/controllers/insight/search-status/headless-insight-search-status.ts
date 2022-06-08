import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {search} from '../../../app/reducers';
import {SearchSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {Controller} from '../../controller/headless-controller';
import {
  CoreSearchStatusState,
  buildCoreSearchStatus,
} from '../../core/search-status/headless-core-search-status';

/**
 * The `SearchStatus` controller provides information on the status of the search.
 */
export interface InsightSearchStatus extends Controller {
  state: InsightSearchStatusState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `SearchStatus` controller.
 */
export interface InsightSearchStatusState extends CoreSearchStatusState {}

/**
 * Creates a `SearchStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SearchStatus` controller instance.
 */
export function buildInsightSearchStatus(
  engine: InsightEngine
): InsightSearchStatus {
  if (!loadSearchStateReducers(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreSearchStatus(engine);

  return {
    ...coreController,

    get state() {
      return {...coreController.state};
    },
  };
}

function loadSearchStateReducers(
  engine: InsightEngine
): engine is InsightEngine<SearchSection> {
  engine.addReducers({search});
  return true;
}
