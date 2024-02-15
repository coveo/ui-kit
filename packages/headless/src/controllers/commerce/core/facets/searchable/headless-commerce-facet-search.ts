import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {FacetSearchSection} from '../../../../../state/state-sections';
import {loadReducerError} from '../../../../../utils/errors';
import {
  FacetSearchProps,
  buildFacetSearch,
} from '../../../../core/facets/facet-search/specific/headless-facet-search';

// TODO: Add JSDoc; it's not getting resolved from the annotations in the generic facet search controller.
export type CommerceFacetSearch = ReturnType<typeof buildCommerceFacetSearch>;

export function buildCommerceFacetSearch(
  engine: CommerceEngine,
  props: Omit<
    FacetSearchProps,
    'executeFacetSearchActionCreator' | 'executeFieldSuggestActionCreator'
  >
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
  } = buildFacetSearch(engine, {
    ...props,
    executeFacetSearchActionCreator: executeCommerceFacetSearch,
    executeFieldSuggestActionCreator: executeCommerceFieldSuggest,
  });

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
