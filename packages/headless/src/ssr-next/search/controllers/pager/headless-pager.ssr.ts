import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildPager,
  type Pager,
  type PagerProps,
} from '../../../../controllers/pager/headless-pager.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/pager/headless-pager.js';

export interface PagerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, Pager> {}

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
