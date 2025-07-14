import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {
  buildCoreQueryError,
  type QueryError,
  type QueryErrorState,
} from '../../core/query-error/headless-core-query-error.js';

export type {QueryError, QueryErrorState};
/**
 * Creates an insight `QueryError` controller instance.
 *
 * @param engine - The headless engine.
 *
 * @group Controllers
 * @category QueryError
 */
export function buildQueryError(engine: InsightEngine): QueryError {
  return buildCoreQueryError(engine);
}
