import type {SearchEngine} from '@coveo/headless';
import {buildPager, type Pager, type PagerProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type Pager,
  type PagerInitialState,
  type PagerOptions,
  type PagerProps,
  type PagerState,
} from '@coveo/headless';

export interface PagerDefinition extends ControllerDefinitionWithoutProps<SearchEngine, Pager> {}

/**
 * Defines a `Pager` controller instance.
 * @group Definers
 *
 * @param props - The configurable `Pager` properties.
 * @returns The `Pager` controller definition.
 * */
export function definePager(props?: PagerProps): PagerDefinition {
  return {
    build: (engine) => buildPager(engine, props),
  };
}
