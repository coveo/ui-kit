import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {Sort, SortProps, buildSort} from './headless-sort';

export * from './headless-sort';

/**
 * Defines a `Sort` controller instance.
 *
 * @param props - The configurable `Sort` properties.
 * @returns The `Sort` controller definition.
 * */
export function defineSort(
  props?: SortProps
): ControllerDefinitionWithoutProps<SearchEngine, Sort> {
  return {
    build: (engine) => buildSort(engine, props),
  };
}
