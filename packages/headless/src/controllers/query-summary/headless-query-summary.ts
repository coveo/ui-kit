import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  buildCoreQuerySummary,
  type QuerySummary,
  type QuerySummaryState,
} from '../core/query-summary/headless-core-query-summary.js';

export type {QuerySummary, QuerySummaryState};
/**
 * Creates a `QuerySummary` controller instance.
 *
 * @param engine - The headless engine instance.
 * @returns A `QuerySummary` controller instance.
 *
 * Example: [query-summary.fn.tsx](https://github.com/coveo/ui-kit/blob/master/packages/samples/headless-react/src/components/query-summary/query-summary.fn.tsx)
 *
 * @group Controllers
 * @category QuerySummary
 */
export function buildQuerySummary(engine: SearchEngine): QuerySummary {
  return buildCoreQuerySummary(engine);
}
