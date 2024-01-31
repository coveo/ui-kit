import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {Pager, PagerProps, buildPager} from './headless-pager';

export * from './headless-pager';

/**
 * Defines a `Pager` controller instance.
 *
 * @param props - The configurable `Pager` properties.
 * @returns The `Pager` controller definition.
 * */
export function definePager(
  props?: PagerProps
): ControllerDefinitionWithoutProps<SearchEngine, Pager> {
  return {
    build: (engine) => buildPager(engine, props),
  };
}
