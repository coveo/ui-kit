import {SpecificFacetSearchResult} from '../../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {
  FacetSearchProps,
  buildFacetSearch,
} from '../../../../core/facets/facet-search/specific/headless-facet-search';

export type CommerceFacetSearchResult = SpecificFacetSearchResult;

export type CommerceFacetSearchState = {
  /**
   * Whether the facet search request is in a pending state.
   */
  isLoading: boolean;
  /**
   * The facet search query.
   */
  query: string;
  /**
   * Whether additional values matching the facet search query are available.
   */
  moreValuesAvailable: boolean;
  /**
   * The returned values matching the facet search query.
   */
  values: CommerceFacetSearchResult[];
};

export type CommerceFacetSearch = Omit<
  ReturnType<typeof buildCommerceFacetSearch>,
  'state'
> & {
  state: CommerceFacetSearchState;
};

export function buildCommerceFacetSearch(
  engine: CommerceEngine,
  props: Omit<
    FacetSearchProps,
    'executeFacetSearchActionCreator' | 'executeFieldSuggestActionCreator'
  >
) {
  const {showMoreResults, updateCaptions, ...restOfFacetSearch} =
    buildFacetSearch(engine, {
      ...props,
      executeFacetSearchActionCreator: executeCommerceFacetSearch,
      executeFieldSuggestActionCreator: executeCommerceFieldSuggest,
    });

  return {
    ...restOfFacetSearch,
  };
}
