import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {
  NumericFacet,
  buildCommerceNumericFacet,
} from '../../core/facets/numeric/headless-commerce-numeric-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';
import {commonOptions} from './headless-search-facet-options';

/**
 * Builds a numeric facet for the search page.
 *
 * Commerce facets are not requested by the implementer, but rather pre-configured through the Coveo Merchandising Hub
 * (CMH). The implementer is only responsible for leveraging the facet controllers created by the
 * `headless-search-facet-generator` controller to properly render facets in their application.
 *
 * @param engine - The commerce engine.
 * @param options - The facet options.
 * @returns The numeric facet.
 */
export function buildSearchNumericFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): NumericFacet {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceNumericFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
