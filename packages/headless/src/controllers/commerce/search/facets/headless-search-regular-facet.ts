import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {CommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {
  CommerceRegularFacet,
  buildCommerceRegularFacet,
} from '../../facets/core/regular/headless-commerce-regular-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';
import {commonOptions} from './headless-search-facet-options';

export function buildSearchRegularFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): CommerceRegularFacet {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceRegularFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
