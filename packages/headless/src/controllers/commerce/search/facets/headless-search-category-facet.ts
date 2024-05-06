import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {
  CategoryFacet,
  buildCategoryFacet,
} from '../../core/facets/category/headless-commerce-category-facet';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {SearchableFacetOptions} from '../../core/facets/searchable/headless-commerce-searchable-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';
import {commonOptions} from './headless-search-facet-options';

export type SearchCategoryFacetBuilder = typeof buildSearchCategoryFacet;

/**
 * Builds a search category facet.
 *
 * @param engine - The commerce engine.
 * @param options - The facet options.
 * @returns The built category facet.
 */
export function buildSearchCategoryFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions & SearchableFacetOptions
): CategoryFacet {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCategoryFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
