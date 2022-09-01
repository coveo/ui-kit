import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {
  buildCoreQueryError,
  QueryError,
  QueryErrorState,
} from '../../core/query-error/headless-core-query-error';

export type {QueryError, QueryErrorState};
/**
 * Creates an insight `QueryError` controller instance.
 *
 * @param engine - The headless engine.
 */
export function buildQueryError(engine: InsightEngine): QueryError {
  return buildCoreQueryError(engine);
}
