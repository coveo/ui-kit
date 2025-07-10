import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {insightFoldedResultAnalyticsClient} from '../../../features/folding/folding-insight-analytics-actions.js';
import {loadCollection} from '../../../features/folding/insight-folding-actions.js';
import {fetchMoreResults} from '../../../features/insight-search/insight-search-actions.js';
import {
  buildCoreFoldedResultList,
  type FoldedCollection,
  type FoldedResult,
  type FoldedResultList,
  type FoldedResultListOptions,
  type FoldedResultListState,
  type FoldingOptions,
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
 *
 * @group Controllers
 * @category FolderResultList
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
