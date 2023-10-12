import {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {
  CategoryFacet,
  CategoryFacetProps,
  buildCategoryFacet,
} from './headless-category-facet.js';

export * from './headless-category-facet.js';

/**
 * @internal
 */
export const defineCategoryFacet = (
  props: CategoryFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, CategoryFacet> => ({
  build: (engine) => buildCategoryFacet(engine, props),
});
