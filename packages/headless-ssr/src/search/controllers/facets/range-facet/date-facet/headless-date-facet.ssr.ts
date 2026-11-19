import type {SearchEngine} from '@coveo/headless';
import {buildDateFacet, type DateFacet, type DateFacetProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../../../types/controller-definition.js';

export {
  type DateFacet,
  type DateFacetOptions,
  type DateFacetProps,
  type DateFacetState,
  type DateRangeInput,
  type DateRangeOptions,
  buildDateRange,
} from '@coveo/headless';

export interface DateFacetDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  DateFacet
> {}

/**
 * Defines a `DateFacet` controller instance.
 * @group Definers
 *
 * @param props - The configurable `DateFacet` properties.
 * @returns The `DateFacet` controller definition.
 * */
export function defineDateFacet(props: DateFacetProps): DateFacetDefinition {
  return {
    build: (engine) => buildDateFacet(engine, props),
  };
}
