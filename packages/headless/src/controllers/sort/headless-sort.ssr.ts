import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {Sort, SortProps, buildSort} from './headless-sort.js';

export * from './headless-sort.js';

export interface SortDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, Sort> {}

/**
 * Defines a `Sort` controller instance.
 *
 * @param props - The configurable `Sort` properties.
 * @returns The `Sort` controller definition.
 * */
export function defineSort(props?: SortProps): SortDefinition {
  return {
    build: (engine) => buildSort(engine, props),
  };
}
