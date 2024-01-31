import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {
  CommerceCategoryFacet,
  buildCommerceCategoryFacet,
} from '../../core/facets/category/headless-commerce-category-facet';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';
import {commonOptions} from './headless-search-facet-options';

export type SearchCategoryFacetBuilder = typeof buildSearchCategoryFacet;

export function buildSearchCategoryFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): CommerceCategoryFacet {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceCategoryFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
