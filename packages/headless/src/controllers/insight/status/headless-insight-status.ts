import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {
  SearchStatusState,
  buildCoreStatus,
  SearchStatus,
} from '../../core/status/headless-core-status';

export type {SearchStatus, SearchStatusState};

/**
 * Creates an insight `SearchStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns An `SearchStatus` controller instance.
 */
export function buildSearchStatus(engine: InsightEngine): SearchStatus {
  return buildCoreStatus(engine);
}
