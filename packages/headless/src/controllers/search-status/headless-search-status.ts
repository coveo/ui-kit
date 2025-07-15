import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  buildCoreStatus,
  type SearchStatus,
  type SearchStatusState,
} from '../core/status/headless-core-status.js';

export type {SearchStatusState, SearchStatus};

/**
 * Creates a `SearchStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SearchStatus` controller instance.
 *
 * @group Controllers
 * @category SearchStatus
 * */
export function buildSearchStatus(engine: SearchEngine): SearchStatus {
  return buildCoreStatus(engine);
}
