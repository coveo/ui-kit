import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {loadReducerError} from '../../../../utils/errors';
import {
  CommerceDateFacet,
  buildCommerceDateFacet,
} from '../../facets/core/date/headless-commerce-date-facet';
import {CommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {loadSearchReducer} from '../utils/load-search-reducers';

export function buildSearchDateFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): CommerceDateFacet {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceDateFacet(engine, {
    ...options,
    fetchResultsActionCreator: executeSearch,
  });
}
