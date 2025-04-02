import {FacetSearchType} from '../../../../../api/commerce/facet-search/facet-search-request.js';
import {SpecificFacetSearchResult} from '../../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response.js';
import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine.js';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {FacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-request-options.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import {FacetSearchSection} from '../../../../../state/state-sections.js';
import {loadReducerError} from '../../../../../utils/errors.js';
import {
  FacetSearchProps,
  buildFacetSearch,
} from '../../../../core/facets/facet-search/specific/headless-facet-search.js';
import {CoreFacetSearchState} from '../searchable/headless-commerce-searchable-facet.js';

export type RegularFacetSearchState =
  CoreFacetSearchState<SpecificFacetSearchResult>;

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
