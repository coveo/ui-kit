import {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {
  buildCoreQuerySummary,
  QuerySummary,
  QuerySummaryState,
} from '../../core/query-summary/headless-core-query-summary.js';

export type {QuerySummary, QuerySummaryState};
/**
 * Creates an insight `QuerySummary` controller instance.
 *
 * @param engine - The insight engine.
 * @returns A `QuerySummary` controller instance.
 */
export function buildQuerySummary(engine: InsightEngine): QuerySummary {
  return buildCoreQuerySummary(engine);
}
