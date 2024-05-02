import {SpecificFacetSearchResult} from '../../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../../app/engine';
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
import {CoreFacetSearchState} from '../searchable/headless-commerce-searchable-facet';

export type RegularFacetSearchState =
  CoreFacetSearchState<SpecificFacetSearchResult>;

export type RegularFacetSearch = Omit<
  ReturnType<typeof buildFacetSearch>,
  'showMoreResults' | 'updateCaptions' | 'state'
> & {
  state: RegularFacetSearchState;
};

export function buildRegularFacetSearch(
  engine: CommerceEngine,
  props: Omit<
    FacetSearchProps,
    'executeFacetSearchActionCreator' | 'executeFieldSuggestActionCreator'
  >
): RegularFacetSearch {
  if (!loadRegularFacetSearchReducers(engine)) {
    throw loadReducerError;
  }

  const {showMoreResults, updateCaptions, ...restOfFacetSearch} =
    buildFacetSearch(
      {
        ...engine,
        get state() {
          return engine[stateKey];
        },
      },
      {
        ...props,
        executeFacetSearchActionCreator: executeCommerceFacetSearch,
        executeFieldSuggestActionCreator: executeCommerceFieldSuggest,
      }
    );

  return {
    ...restOfFacetSearch,
  };
}

function loadRegularFacetSearchReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FacetSearchSection> {
  engine.addReducers({facetSearchSet});
  return true;
}
