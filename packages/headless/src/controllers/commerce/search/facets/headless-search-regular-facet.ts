import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {
  RegularFacet,
  buildCommerceRegularFacet,
} from '../../core/facets/regular/headless-commerce-regular-facet';
import {SearchableFacetOptions} from '../../core/facets/searchable/headless-commerce-searchable-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';
import {commonOptions} from './headless-search-facet-options';

/**
 * Builds a regular facet for search functionality.
 *
 * @param engine - The commerce engine.
 * @param options - The facet options and searchable facet options.
 * @returns The regular facet.
 */
export function buildSearchRegularFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions & SearchableFacetOptions
): RegularFacet {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceRegularFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
