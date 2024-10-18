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

// TODO(nico): This "specific" type might need to change
export type LocationFacetSearchState =
  CoreFacetSearchState<SpecificFacetSearchResult>;

export type LocationFacetSearch = Omit<
  ReturnType<typeof buildFacetSearch>,
  'showMoreResults' | 'updateCaptions' | 'state'
>;

export interface LocationFacetSearchProps
  extends Omit<
    FacetSearchProps,
    'executeFacetSearchActionCreator' | 'executeFieldSuggestActionCreator'
  > {
  options: FacetSearchOptions & {type: FacetSearchType};
}

export function buildLocationFacetSearch(
  engine: CommerceEngine,
  props: LocationFacetSearchProps
): LocationFacetSearch {
  if (!loadLocationFacetSearchReducers(engine)) {
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

function loadLocationFacetSearchReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FacetSearchSection> {
  engine.addReducers({facetSearchSet});
  return true;
}
