import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  buildCoreStatus,
  SearchStatusState,
  SearchStatus,
} from '../core/status/headless-core-status.js';

export type {SearchStatusState, SearchStatus};

/**
 * Creates a `SearchStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SearchStatus` controller instance.
 * */
export function buildSearchStatus(engine: SearchEngine): SearchStatus {
  return buildCoreStatus(engine);
}
