import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {fetchMoreResults} from '../../features/search/search-actions.js';
import {
  buildCoreResultList,
  ResultList,
  ResultListOptions,
  ResultListProps,
  ResultListState,
} from '../core/result-list/headless-core-result-list.js';

export type {ResultListOptions, ResultListProps, ResultListState, ResultList};

/**
 * Creates a `ResultList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `ResultList` properties.
 * @returns A `ResultList` controller instance.
 */
export function buildResultList(
  engine: SearchEngine,
  props?: ResultListProps
): ResultList {
  return buildCoreResultList(engine, {
    ...props,
    fetchMoreResultsActionCreator: fetchMoreResults,
  });
}
