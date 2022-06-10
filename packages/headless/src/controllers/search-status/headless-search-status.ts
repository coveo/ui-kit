import {Controller} from '../controller/headless-controller';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  buildCoreStatus,
  CoreStatusState,
} from '../core/status/headless-core-status';

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
export interface SearchStatusState extends CoreStatusState {}

/**
 * Creates a `SearchStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SearchStatus` controller instance.
 * */
export function buildSearchStatus(engine: SearchEngine): SearchStatus {
  return buildCoreStatus(engine);
}
