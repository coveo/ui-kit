import {fetchMoreResults} from '../../../features/insight-search/insight-search-actions';
import {InsightEngine} from '../../../insight.index';
import {
  buildCoreResultList,
  ResultList,
  ResultListOptions,
  ResultListProps,
  ResultListState,
} from '../../core/result-list/headless-core-result-list';

export type {ResultListOptions, ResultListProps, ResultListState, ResultList};

/**
 * Creates an insight `ResultList` controller instance.
 * @param engine - The insight engine.
 * @param props - The `ResultList` controller properties.
 * @returns An `ResultList` controller instance.
 */
export function buildResultList(
  engine: InsightEngine,
  props?: ResultListProps
): ResultList {
  return buildCoreResultList(engine, {
    ...props,
    fetchMoreResultsActionCreator: fetchMoreResults,
  });
}
