import type {SearchEngine} from '@coveo/headless';
import {buildSort, type Sort, type SortProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {type Sort, type SortInitialState, type SortProps, type SortState} from '@coveo/headless';

export interface SortDefinition extends ControllerDefinitionWithoutProps<SearchEngine, Sort> {}

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
