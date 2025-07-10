import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {
  buildCoreQuerySummary,
  type QuerySummary,
  type QuerySummaryState,
} from '../../core/query-summary/headless-core-query-summary.js';

export type {QuerySummary, QuerySummaryState};
/**
 * Creates an insight `QuerySummary` controller instance.
 *
 * @param engine - The insight engine.
 * @returns A `QuerySummary` controller instance.
 *
 * @group Controllers
 * @category QuerySummary
 */
export function buildQuerySummary(engine: InsightEngine): QuerySummary {
  return buildCoreQuerySummary(engine);
}
