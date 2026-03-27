import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureSearchEngine} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  buildCoreStatus,
  type SearchStatus,
  type SearchStatusState,
} from '../core/status/headless-core-status.js';

export type {SearchStatus, SearchStatusState};

/**
 * Creates a `SearchStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SearchStatus` controller instance.
 *
 * @group Controllers
 * @category SearchStatus
 * */
export function buildSearchStatus(
  engine: SearchEngine | FrankensteinEngine
): SearchStatus {
  return buildCoreStatus(ensureSearchEngine(engine));
}
