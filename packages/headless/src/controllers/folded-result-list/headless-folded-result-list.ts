import {SearchEngine} from '../../app/search-engine/search-engine';
import {loadCollection} from '../../features/folding/folding-actions';
// import {foldedResultAnalyticsClient} from '../../features/folding/folding-analytics-actions';
import {fetchMoreResults} from '../../features/search/search-actions';
import {
  buildCoreFoldedResultList,
  FoldingOptions,
  FoldedResultList,
  FoldedResultListOptions,
  FoldedResultListState,
  FoldedCollection,
  FoldedResult,
} from '../core/folded-result-list/headless-core-folded-result-list';

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
    // foldedResultAnalyticsClient
  );
  return {
    ...foldedResultList,

    get state() {
      return foldedResultList.state;
    },
  };
}
