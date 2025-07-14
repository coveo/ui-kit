import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {loadCollection} from '../../features/folding/folding-actions.js';
import {foldedResultAnalyticsClient} from '../../features/folding/folding-analytics-actions.js';
import {fetchMoreResults} from '../../features/search/search-actions.js';
import {
  buildCoreFoldedResultList,
  type FoldedCollection,
  type FoldedResult,
  type FoldedResultList,
  type FoldedResultListOptions,
  type FoldedResultListState,
  type FoldingOptions,
} from '../core/folded-result-list/headless-core-folded-result-list.js';

export type {
  FoldedResultListOptions,
  FoldedResultListState,
  FoldedResultList,
  FoldingOptions,
  FoldedCollection,
  FoldedResult,
};

export interface FoldedResultListProps {
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
 * @category FoldedResultList
 */
export function buildFoldedResultList(
  engine: SearchEngine,
  props: FoldedResultListProps = {}
): FoldedResultList {
  const foldedResultList = buildCoreFoldedResultList(
    engine,
    {
      ...props,
      loadCollectionActionCreator: loadCollection,
      fetchMoreResultsActionCreator: fetchMoreResults,
    },
    foldedResultAnalyticsClient
  );
  return {
    ...foldedResultList,

    get state() {
      return foldedResultList.state;
    },
  };
}
