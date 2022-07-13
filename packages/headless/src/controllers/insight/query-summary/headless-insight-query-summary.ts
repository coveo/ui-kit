import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {
  buildCoreQuerySummary,
  QuerySummary,
  QuerySummaryState,
} from '../../core/query-summary/headless-core-query-summary';

export type {QuerySummary, QuerySummaryState};
/**
 * Creates a `InsightQuerySummary` controller instance.
 *
 * @param engine - The headless engine instance.
 * @returns A `InsightQuerySummary` controller instance.
 */
export function buildQuerySummary(engine: InsightEngine): QuerySummary {
  return buildCoreQuerySummary(engine);
}
