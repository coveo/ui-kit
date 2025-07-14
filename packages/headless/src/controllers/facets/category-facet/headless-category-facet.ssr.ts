import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {
  buildCategoryFacet,
  type CategoryFacet,
  type CategoryFacetProps,
} from './headless-category-facet.js';

export * from './headless-category-facet.js';

export interface CategoryFacetDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, CategoryFacet> {}

/**
 * Defines a `CategoryFacet` controller instance.
 * @group Definers
 *
 * @param props - The configurable `CategoryFacet` properties.
 * @returns The `CategoryFacet` controller definition.
 * */
export function defineCategoryFacet(
  props: CategoryFacetProps
): CategoryFacetDefinition {
  return {
    build: (engine) => buildCategoryFacet(engine, props),
  };
}
