import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  CategoryFacet,
  CategoryFacetProps,
  buildCategoryFacet,
} from './headless-category-facet';

export * from './headless-category-facet';

/**
 * @alpha
 */
export const defineCategoryFacet = (
  props: CategoryFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, CategoryFacet> => ({
  build: (engine) => buildCategoryFacet(engine, props),
});
