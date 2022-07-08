import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {Controller} from '../../controller/headless-controller';
import {
  buildCoreQuerySummary,
  CoreQuerySummaryState,
} from '../../core/query-summary/headless-core-query-summary';

/**
 * The `InsightQuerySummary` controller provides information about the current query and results (e.g., "Results
 * 1-10 of 123").
 * */
export interface InsightQuerySummary extends Controller {
  /** The state relevant to the `InsightQuerySummary` controller.*/
  state: InsightQuerySummaryState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `InsightQuerySummary` controller.
 */
export interface InsightQuerySummaryState extends CoreQuerySummaryState {}

/**
 * Creates a `InsightQuerySummary` controller instance.
 *
 * @param engine - The headless engine instance.
 * @returns A `InsightQuerySummary` controller instance.
 */
export function buildInsightQuerySummary(
  engine: InsightEngine
): InsightQuerySummary {
  return buildCoreQuerySummary(engine);
}
