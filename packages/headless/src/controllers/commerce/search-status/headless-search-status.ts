import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {firstSearchExecutedSelector} from '../../../features/commerce/search/search-selectors';
import {
  SearchStatusState,
  SearchStatus,
} from '../../core/status/headless-core-status';
import {buildCoreStatus} from '../core/status/headless-core-status';

export type {SearchStatusState, SearchStatus};

/**
 * Creates a `SearchStatus` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SearchStatus` controller instance.
 * @internal
 * */
export function buildSearchStatus(engine: CommerceEngine): SearchStatus {
  return buildCoreStatus(engine, {
    firstSearchExecutedSelector,
  });
}
