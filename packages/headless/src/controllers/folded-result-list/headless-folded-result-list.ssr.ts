import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  FoldedResultList,
  FoldedResultListProps,
  buildFoldedResultList,
} from './headless-folded-result-list';

export * from './headless-folded-result-list';

/**
 * @alpha
 */
export const defineFoldedResultList = (
  props?: FoldedResultListProps
): ControllerDefinitionWithoutProps<SearchEngine, FoldedResultList> => ({
  build: (engine) => buildFoldedResultList(engine, props),
});
