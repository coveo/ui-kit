import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  FoldedResultList,
  FoldedResultListProps,
  buildFoldedResultList,
} from './headless-folded-result-list';

export * from './headless-folded-result-list';

/**
 * Defines a `FoldedResultList` controller instance.
 *
 * @param props - The configurable `FoldedResultList` properties.
 * @returns The `FoldedResultList` controller definition.
 * */
export function defineFoldedResultList(
  props?: FoldedResultListProps
): ControllerDefinitionWithoutProps<SearchEngine, FoldedResultList> {
  return {
    build: (engine) => buildFoldedResultList(engine, props),
  };
}
