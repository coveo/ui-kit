import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {loadReducerError} from '../../../../utils/errors';
import {CoreCommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {
  CommerceRegularFacet,
  buildCommerceRegularFacet,
} from '../../facets/core/regular/headless-commerce-regular-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';

export type SearchRegularFacetOptions = Omit<
  CoreCommerceFacetOptions,
  | 'fetchResultsActionCreator'
  | 'toggleSelectActionCreator'
  | 'toggleExcludeActionCreator'
>;

export type SearchRegularFacetBuilder = typeof buildSearchRegularFacet;

export function buildSearchRegularFacet(
  engine: CommerceEngine,
  options: SearchRegularFacetOptions
): CommerceRegularFacet {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceRegularFacet(engine, {
    ...options,
    fetchResultsActionCreator: executeSearch,
  });
}
