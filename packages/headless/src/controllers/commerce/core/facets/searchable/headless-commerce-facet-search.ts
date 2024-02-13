import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {FacetSearchSection} from '../../../../../state/state-sections';
import {loadReducerError} from '../../../../../utils/errors';
import {
  FacetSearchProps,
  buildFacetSearch,
} from '../../../../core/facets/facet-search/specific/headless-facet-search';

export type CommerceFacetSearch = ReturnType<typeof buildCommerceFacetSearch>;

export function buildCommerceFacetSearch(
  engine: CommerceEngine,
  props: FacetSearchProps
) {
  if (!loadCommerceFacetSearchReducers(engine)) {
    throw loadReducerError;
  }

  const {
    clear,
    exclude,
    search,
    select,
    singleExclude,
    singleSelect,
    state,
    updateText,
  } = buildFacetSearch(engine, props);

  return {
    clear,
    exclude,
    search,
    select,
    singleExclude,
    singleSelect,
    state,
    updateText,
  };
}

function loadCommerceFacetSearchReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FacetSearchSection> {
  engine.addReducers({facetSearchSet});
  return true;
}
