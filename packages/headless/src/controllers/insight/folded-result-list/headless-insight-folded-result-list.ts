import {insightFoldedResultAnalyticsClient} from '../../../features/folding/folding-insight-analytics-actions';
import {loadCollection} from '../../../features/folding/insight-folding-actions';
import {InsightEngine} from '../../../insight.index';
import {
  CoreFoldedResultListState,
  CoreFoldedResultList,
  buildCoreFoldedResultList,
  FoldedResultListOptions,
} from '../../core/folded-result-list/headless-core-folded-result-list';

export type {
  FoldedResultListOptions,
  CoreFoldedResultListState,
  CoreFoldedResultList,
} from '../../core/folded-result-list/headless-core-folded-result-list';

/**
 * A scoped and simplified part of the headless state that is relevant to the `FoldedResultList` controller.
 * */
export interface FoldedResultListState extends CoreFoldedResultListState {}

/**
 * The `FoldedResultList` headless controller re-organizes results into hierarchical collections (a.k.a. threads).
 */
export interface FoldedResultList extends CoreFoldedResultList {
  /**
   * The state of the `FoldedResultList` controller.
   */
  state: FoldedResultListState;
}
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
  engine: InsightEngine,
  props: FoldedResultListProps = {}
): FoldedResultList {
  const foldedResultList = buildCoreFoldedResultList(
    engine,
    {...props, loadCollectionActionCreator: loadCollection},
    insightFoldedResultAnalyticsClient
  );
  return {
    ...foldedResultList,
    get state() {
      return foldedResultList.state;
    },
  };
}
