import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildFoldedResultList,
  type FoldedResultList,
  type FoldedResultListProps,
} from '../../../../controllers/folded-result-list/headless-folded-result-list.js';
import type {ControllerDefinitionWithoutProps} from '../../../common/types/controllers.js';

export * from '../../../../controllers/folded-result-list/headless-folded-result-list.js';

export interface FoldedResultListDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, FoldedResultList> {}

/**
 * Defines a `FoldedResultList` controller instance.
 * @group Definers
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
