import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  FoldedResultList,
  FoldedResultListProps,
  buildFoldedResultList,
} from './headless-folded-result-list.js';

export * from './headless-folded-result-list.js';

/**
 * @internal
 */
export const defineFoldedResultList = (
  props?: FoldedResultListProps
): ControllerDefinitionWithoutProps<SearchEngine, FoldedResultList> => ({
  build: (engine) => buildFoldedResultList(engine, props),
});
