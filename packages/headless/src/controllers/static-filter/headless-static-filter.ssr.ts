import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildStaticFilter,
  type StaticFilter,
  type StaticFilterProps,
} from './headless-static-filter.js';

export * from './headless-static-filter.js';

export {buildStaticFilterValue} from './headless-static-filter.js';

export interface StaticFilterDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, StaticFilter> {}

/**
 * Defines a `StaticFilter` controller instance.
 * @group Definers
 *
 * @param props - The configurable `StaticFilter` properties.
 * @returns The `StaticFilter` controller definition.
 * */
export function defineStaticFilter(
  props: StaticFilterProps
): StaticFilterDefinition {
  return {
    build: (engine) => buildStaticFilter(engine, props),
  };
}
