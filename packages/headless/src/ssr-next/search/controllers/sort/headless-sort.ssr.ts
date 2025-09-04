import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildSort,
  type Sort,
  type SortProps,
} from '../../../../controllers/sort/headless-sort.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/sort/headless-sort.js';

export interface SortDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, Sort> {}

/**
 * Defines a `Sort` controller instance.
 * @group Definers
 *
 * @param props - The configurable `Sort` properties.
 * @returns The `Sort` controller definition.
 * */
export function defineSort(props?: SortProps): SortDefinition {
  return {
    build: (engine) => buildSort(engine, props),
  };
}
