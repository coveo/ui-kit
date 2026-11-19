import type {SearchEngine} from '@coveo/headless';
import {buildCategoryFacet, type CategoryFacet, type CategoryFacetProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../../types/controller-definition.js';

export {
  type CategoryFacet,
  type CategoryFacetOptions,
  type CategoryFacetProps,
  type CategoryFacetSearch,
  type CategoryFacetSearchOptions,
  type CategoryFacetSearchResult,
  type CategoryFacetSearchState,
  type CategoryFacetState,
  type CoreCategoryFacet,
  type CoreCategoryFacetState,
} from '@coveo/headless';

export interface CategoryFacetDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  CategoryFacet
> {}

/**
 * Defines a `CategoryFacet` controller instance.
 * @group Definers
 *
 * @param props - The configurable `CategoryFacet` properties.
 * @returns The `CategoryFacet` controller definition.
 * */
export function defineCategoryFacet(props: CategoryFacetProps): CategoryFacetDefinition {
  return {
    build: (engine) => buildCategoryFacet(engine, props),
  };
}
