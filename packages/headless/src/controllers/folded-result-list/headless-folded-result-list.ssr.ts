import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  FoldedResultList,
  FoldedResultListProps,
  buildFoldedResultList,
} from './headless-folded-result-list.js';

export * from './headless-folded-result-list.js';

export interface FoldedResultListDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, FoldedResultList> {}

/**
 * Defines a `FoldedResultList` controller instance.
 *
 * @param props - The configurable `FoldedResultList` properties.
 * @returns The `FoldedResultList` controller definition.
 * */
export function defineFoldedResultList(
  props?: FoldedResultListProps
): FoldedResultListDefinition {
  return {
    build: (engine) => buildFoldedResultList(engine, props),
  };
}
