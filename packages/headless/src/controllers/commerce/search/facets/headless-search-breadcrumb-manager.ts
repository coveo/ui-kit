import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {
  BreadcrumbManager,
  buildCoreBreadcrumbManager,
} from '../../core/breadcrumb-manager/headless-core-breadcrumb-manager';
import {facetResponseSelector} from './headless-search-facet-options';

/**
 * Creates `SearchBreadcrumbManager` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `SearchBreadcrumbManager` controller instance.
 */
export function buildSearchBreadcrumbManager(
  engine: CommerceEngine
): BreadcrumbManager {
  return buildCoreBreadcrumbManager(engine, {
    facetResponseSelector: facetResponseSelector,
    fetchResultsActionCreator: executeSearch,
  });
}
