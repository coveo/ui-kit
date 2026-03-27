import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureSearchEngine} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  buildCoreQueryError,
  type QueryError,
  type QueryErrorState,
} from '../core/query-error/headless-core-query-error.js';

export type {QueryError, QueryErrorState};

/**
 * Creates a `QueryError` controller instance.
 *
 * @param engine - The headless engine.
 *
 * @group Controllers
 * @category QueryError
 */
export function buildQueryError(
  engine: SearchEngine | FrankensteinEngine
): QueryError {
  return buildCoreQueryError(ensureSearchEngine(engine));
}
