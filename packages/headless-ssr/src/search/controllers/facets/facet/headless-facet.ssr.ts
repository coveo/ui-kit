import type {SearchEngine} from '@coveo/headless';
import {buildFacet, type Facet, type FacetProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../../types/controller-definition.js';

export {
  type CoreFacet,
  type CoreFacetState,
  type Facet,
  type FacetOptions,
  type FacetSearch,
  type FacetSearchOptions,
  type FacetSearchState,
  type FacetState,
  type FacetValue,
  type FacetValueState,
  type SpecificFacetSearchResult,
  type FacetProps,
} from '@coveo/headless';

export interface FacetDefinition extends ControllerDefinitionWithoutProps<SearchEngine, Facet> {}

/**
 * Defines a `Facet` controller instance.
 * @group Definers
 *
 * @param props - The configurable `Facet` properties.
 * @returns The `Facet` controller definition.
 * */
export function defineFacet(props: FacetProps): FacetDefinition {
  return {
    build: (engine) => buildFacet(engine, props),
  };
}
