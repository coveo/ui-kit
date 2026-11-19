import type {SearchEngine} from '@coveo/headless';
import {
  buildFoldedResultList,
  type FoldedResultList,
  type FoldedResultListProps,
} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type FoldedCollection,
  type FoldedResult,
  type FoldedResultList,
  type FoldedResultListOptions,
  type FoldedResultListState,
  type FoldingOptions,
  type FoldedResultListProps,
} from '@coveo/headless';

export interface FoldedResultListDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  FoldedResultList
> {}

/**
 * Defines a `FoldedResultList` controller instance.
 * @group Definers
 *
 * @param props - The configurable `FoldedResultList` properties.
 * @returns The `FoldedResultList` controller definition.
 * */
export function defineFoldedResultList(props?: FoldedResultListProps): FoldedResultListDefinition {
  return {
    build: (engine) => buildFoldedResultList(engine, props),
  };
}
