import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  buildCoreQueryError,
  QueryError,
  QueryErrorState,
} from '../core/query-error/headless-core-query-error.js';

export type {QueryError, QueryErrorState};

/**
 * Creates a `QueryError` controller instance.
 *
 * @param engine - The headless engine.
 */
export function buildQueryError(engine: SearchEngine): QueryError {
  return buildCoreQueryError(engine);
}
