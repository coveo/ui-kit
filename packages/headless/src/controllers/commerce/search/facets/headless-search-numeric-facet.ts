import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {loadReducerError} from '../../../../utils/errors';
import {CoreCommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {
  CommerceNumericFacet,
  buildCommerceNumericFacet,
} from '../../facets/core/numeric/headless-commerce-numeric-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';

export type SearchNumericFacetOptions = Omit<
  CoreCommerceFacetOptions,
  | 'fetchResultsActionCreator'
  | 'toggleSelectActionCreator'
  | 'toggleExcludeActionCreator'
>;

export type SearchNumericFacetBuilder = typeof buildSearchNumericFacet;

export function buildSearchNumericFacet(
  engine: CommerceEngine,
  options: SearchNumericFacetOptions
): CommerceNumericFacet {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceNumericFacet(engine, {
    ...options,
    fetchResultsActionCreator: executeSearch,
  });
}
