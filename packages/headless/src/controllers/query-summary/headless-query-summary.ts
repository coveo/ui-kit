import {Controller} from '../controller/headless-controller';
import {SearchEngine} from '../../app/search-engine/search-engine';

import {
  buildCoreQuerySummary,
  CoreQuerySummaryState,
} from '../core/query-summary/headless-core-query-summary';

/**
 * The `QuerySummary` controller provides information about the current query and results (e.g., "Results
 * 1-10 of 123").
 * */
export interface QuerySummary extends Controller {
  /** The state relevant to the `QuerySummary` controller.*/
  state: QuerySummaryState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `QuerySummary` controller.
 */
export interface QuerySummaryState extends CoreQuerySummaryState {}

/**
 * Creates a `QuerySummary` controller instance.
 *
 * @param engine - The headless engine instance.
 * @returns A `QuerySummary` controller instance.
 */
export function buildQuerySummary(engine: SearchEngine): QuerySummary {
  return buildCoreQuerySummary(engine);
}
