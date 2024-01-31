import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {Sort, SortProps, buildSort} from './headless-sort';

export * from './headless-sort';

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
