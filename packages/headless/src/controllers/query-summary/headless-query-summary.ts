import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  buildCoreQuerySummary,
  QuerySummary,
  QuerySummaryState,
} from '../core/query-summary/headless-core-query-summary.js';

export type {QuerySummary, QuerySummaryState};
/**
 * Creates a `QuerySummary` controller instance.
 *
 * @param engine - The headless engine instance.
 * @returns A `QuerySummary` controller instance.
 */
export function buildQuerySummary(engine: SearchEngine): QuerySummary {
  return buildCoreQuerySummary(engine);
}
