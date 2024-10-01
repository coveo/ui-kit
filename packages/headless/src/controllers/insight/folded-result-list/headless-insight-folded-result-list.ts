import {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {insightFoldedResultAnalyticsClient} from '../../../features/folding/folding-insight-analytics-actions.js';
import {loadCollection} from '../../../features/folding/insight-folding-actions.js';
import {fetchMoreResults} from '../../../features/insight-search/insight-search-actions.js';
import {
  buildCoreFoldedResultList,
  FoldingOptions,
  FoldedCollection,
  FoldedResult,
  FoldedResultList,
  FoldedResultListOptions,
  FoldedResultListState,
} from '../../core/folded-result-list/headless-core-folded-result-list.js';

export type {
  FoldedResultListOptions,
  FoldedResultListState,
  FoldedResultList,
  FoldingOptions,
  FoldedCollection,
  FoldedResult,
};

export interface InsightFoldedResultListProps {
  /**
   * The options for the `FoldedResultList` controller.
   * */
  options?: FoldedResultListOptions;
}

/**
 * Creates a `FoldedResultList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `FoldedResultList` properties.
 * @returns A `FoldedResultList` controller instance.
 */
export function buildFoldedResultList(
  engine: InsightEngine,
  props: InsightFoldedResultListProps = {}
): FoldedResultList {
  const foldedResultList = buildCoreFoldedResultList(
    engine,
    {
      ...props,
      loadCollectionActionCreator: loadCollection,
      fetchMoreResultsActionCreator: fetchMoreResults,
    },
    insightFoldedResultAnalyticsClient
  );
  return {
    ...foldedResultList,
    get state() {
      return foldedResultList.state;
    },
  };
}
