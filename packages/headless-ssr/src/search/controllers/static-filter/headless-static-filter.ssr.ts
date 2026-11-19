import type {SearchEngine} from '@coveo/headless';
import {buildStaticFilter, type StaticFilter, type StaticFilterProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type StaticFilterValue,
  type StaticFilterValueOptions,
  type StaticFilterValueState,
  buildStaticFilterValue,
  type StaticFilterProps,
  type StaticFilterOptions,
  type StaticFilter,
  type StaticFilterState,
} from '@coveo/headless';

export interface StaticFilterDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  StaticFilter
> {}

/**
 * Defines a `StaticFilter` controller instance.
 * @group Definers
 *
 * @param props - The configurable `StaticFilter` properties.
 * @returns The `StaticFilter` controller definition.
 * */
export function defineStaticFilter(props: StaticFilterProps): StaticFilterDefinition {
  return {
    build: (engine) => buildStaticFilter(engine, props),
  };
}
