import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  FoldedResultList,
  FoldedResultListProps,
  buildFoldedResultList,
} from './headless-folded-result-list';

export type {
  FoldingOptions,
  FoldedCollection,
  FoldedResult,
  FoldedResultListOptions,
  FoldedResultListProps,
  FoldedResultList,
  FoldedResultListState,
} from './headless-folded-result-list';

/**
 * @internal
 */
export const defineFoldedResultList = (
  props?: FoldedResultListProps
): ControllerDefinitionWithoutProps<SearchEngine, FoldedResultList> => ({
  build: (engine) => buildFoldedResultList(engine, props),
});
