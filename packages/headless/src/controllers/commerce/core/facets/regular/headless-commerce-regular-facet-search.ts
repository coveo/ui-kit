import {FacetSearchType} from '../../../../../api/commerce/facet-search/facet-search-request';
import {SpecificFacetSearchResult} from '../../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {FacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-request-options';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {FacetSearchSection} from '../../../../../state/state-sections';
import {loadReducerError} from '../../../../../utils/errors';
import {
  FacetSearchProps,
  buildFacetSearch,
} from '../../../../core/facets/facet-search/specific/headless-facet-search';
import {CoreFacetSearchState} from '../searchable/headless-commerce-searchable-facet';

/**
 * @group Generated controllers
 * @category RegularFacet
 */
export interface RegularFacetSearchState
  extends CoreFacetSearchState<SpecificFacetSearchResult> {}

export type RegularFacetSearch = Omit<
  ReturnType<typeof buildFacetSearch>,
  'showMoreResults' | 'updateCaptions' | 'state'
>;

export interface RegularFacetSearchProps
  extends Omit<
    FacetSearchProps,
    'executeFacetSearchActionCreator' | 'executeFieldSuggestActionCreator'
  > {
  options: FacetSearchOptions & {type: FacetSearchType};
}

export function buildRegularFacetSearch(
  engine: CommerceEngine,
  props: RegularFacetSearchProps
): RegularFacetSearch {
  if (!loadRegularFacetSearchReducers(engine)) {
    throw loadReducerError;
  }

  const {showMoreResults, state, updateCaptions, ...restOfFacetSearch} =
    buildFacetSearch(engine, {
      ...props,
      executeFacetSearchActionCreator: (facetId: string) =>
        executeCommerceFacetSearch({
          facetId,
          facetSearchType: props.options.type,
        }),
      executeFieldSuggestActionCreator: (facetId: string) =>
        executeCommerceFieldSuggest({
          facetId,
          facetSearchType: props.options.type,
        }),
    });

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
