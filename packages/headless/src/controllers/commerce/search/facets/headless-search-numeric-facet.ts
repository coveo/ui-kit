import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {CommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {
  CommerceNumericFacet,
  buildCommerceNumericFacet,
} from '../../facets/core/numeric/headless-commerce-numeric-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';
import {commonOptions} from './headless-search-facet-options';

export function buildSearchNumericFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): CommerceNumericFacet {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceNumericFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
