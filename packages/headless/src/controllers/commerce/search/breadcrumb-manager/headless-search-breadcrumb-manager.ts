import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {loadReducerError} from '../../../../utils/errors';
import {
  BreadcrumbManager,
  buildCoreBreadcrumbManager,
} from '../../core/breadcrumb-manager/headless-core-breadcrumb-manager';
import {facetResponseSelector} from '../facets/headless-search-facet-options';
import {loadSearchReducer} from '../utils/load-search-reducers';

/**
 * Creates `SearchBreadcrumbManager` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `SearchBreadcrumbManager` controller instance.
 */
export function buildSearchBreadcrumbManager(
  engine: CommerceEngine
): BreadcrumbManager {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCoreBreadcrumbManager(engine, {
    facetResponseSelector: facetResponseSelector,
    fetchProductsActionCreator: executeSearch,
  });
}
