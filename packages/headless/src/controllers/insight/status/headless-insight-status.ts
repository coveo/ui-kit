import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {
  buildCoreStatus,
  type SearchStatus,
  type SearchStatusState,
} from '../../core/status/headless-core-status.js';

export type {SearchStatus, SearchStatusState};

/**
 * Creates an insight `SearchStatus` controller instance.
 *
 * @param engine - The insight engine.
 * @returns A `SearchStatus` controller instance.
 *
 * @group Controllers
 * @category SearchStatus
 */
export function buildSearchStatus(engine: InsightEngine): SearchStatus {
  return buildCoreStatus(engine);
}
