import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {Pager, PagerProps, buildPager} from './headless-pager.js';

export * from './headless-pager.js';

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
