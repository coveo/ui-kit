import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {Pager, PagerProps, buildPager} from './headless-pager';

export * from './headless-pager';

export interface PagerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, Pager> {}

/**
 * Defines a `Pager` controller instance.
 *
 * @param props - The configurable `Pager` properties.
 * @returns The `Pager` controller definition.
 * */
export function definePager(props?: PagerProps): PagerDefinition {
  return {
    build: (engine) => buildPager(engine, props),
  };
}
