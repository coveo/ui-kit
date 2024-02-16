import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  CategoryFacet,
  CategoryFacetProps,
  buildCategoryFacet,
} from './headless-category-facet';

export * from './headless-category-facet';

export interface CategoryFacetDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, CategoryFacet> {}

/**
 * Defines a `CategoryFacet` controller instance.
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
