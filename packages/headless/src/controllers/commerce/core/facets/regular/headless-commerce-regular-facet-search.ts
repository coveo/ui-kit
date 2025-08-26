import type {FacetSearchType} from '../../../../../api/commerce/facet-search/facet-search-request.js';
import type {SpecificFacetSearchResult} from '../../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response.js';
import type {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine.js';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import type {FacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-request-options.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import type {FacetSearchSection} from '../../../../../state/state-sections.js';
import {loadReducerError} from '../../../../../utils/errors.js';
import {
  buildFacetSearch,
  type FacetSearchProps,
} from '../../../../core/facets/facet-search/specific/headless-facet-search.js';
import type {CoreFacetSearchState} from '../searchable/headless-commerce-searchable-facet.js';

export type RegularFacetSearchState =
  CoreFacetSearchState<SpecificFacetSearchResult>;

export type RegularFacetSearch = Omit<
  ReturnType<typeof buildFacetSearch>,
  'updateCaptions' | 'state'
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

  const {
    state: _state,
    updateCaptions: _updateCaptions,
    ...restOfFacetSearch
  } = buildFacetSearch(engine, {
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
