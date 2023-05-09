import {insightFoldedResultAnalyticsClient} from '../../../features/folding/folding-insight-analytics-actions';
import {InsightEngine} from '../../../insight.index';
import {
  CoreFoldedResultListState,
  CoreFoldedResultList,
  FoldedResultListProps,
  buildCoreFoldedResultList,
} from '../../core/folded-result-list/headless-core-folded-result-list';

export type {
  FoldedResultListOptions,
  FoldedResultListProps,
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

/**
 * Creates a `FoldedResultList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `FoldedResultList` properties.
 * @returns A `FoldedResultList` controller instance.
 */
export function buildFoldedResultList(
  engine: InsightEngine,
  props: FoldedResultListProps
): FoldedResultList {
  const foldedResultList = buildCoreFoldedResultList(
    engine,
    props,
    insightFoldedResultAnalyticsClient
  );
  return {
    ...foldedResultList,
    get state() {
      return foldedResultList.state;
    },
  };
}
