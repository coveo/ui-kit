import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {
  NumericFacet,
  buildCommerceNumericFacet,
} from '../../core/facets/numeric/headless-commerce-numeric-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';
import {commonOptions} from './headless-search-facet-options';

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
