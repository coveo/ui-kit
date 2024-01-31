import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  StaticFilter,
  StaticFilterProps,
  buildStaticFilter,
} from './headless-static-filter';

export * from './headless-static-filter';

export {buildStaticFilterValue} from './headless-static-filter';

/**
 * Defines a `StaticFilter` controller instance.
 *
 * @param props - The configurable `StaticFilter` properties.
 * @returns The `StaticFilter` controller definition.
 * */
export function defineStaticFilter(
  props: StaticFilterProps
): ControllerDefinitionWithoutProps<SearchEngine, StaticFilter> {
  return {
    build: (engine) => buildStaticFilter(engine, props),
  };
}
