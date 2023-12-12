import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {loadReducerError} from '../../../../utils/errors';
import {
  CommerceDateFacet,
  buildCommerceDateFacet,
} from '../../facets/core/date/headless-commerce-date-facet';
import {CoreCommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';

export type SearchDateFacetOptions = Omit<
  CoreCommerceFacetOptions,
  | 'fetchResultsActionCreator'
  | 'toggleSelectActionCreator'
  | 'toggleExcludeActionCreator'
>;

export type SearchDateFacetBuilder = typeof buildSearchDateFacet;

export function buildSearchDateFacet(
  engine: CommerceEngine,
  options: SearchDateFacetOptions
): CommerceDateFacet {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceDateFacet(engine, {
    ...options,
    fetchResultsActionCreator: executeSearch,
  });
}
