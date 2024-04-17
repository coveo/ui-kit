import {SpecificFacetSearchResult} from '../../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {defaultSolutionTypeId} from '../../../../../features/commerce/common/actions';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {
  FacetSearchProps,
  buildFacetSearch,
} from '../../../../core/facets/facet-search/specific/headless-facet-search';

export type FacetSearchResult = SpecificFacetSearchResult;

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
  values: FacetSearchResult[];
};

export type FacetSearch = Omit<
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
      executeFacetSearchActionCreator: (facetId: string) =>
        executeCommerceFacetSearch({
          solutionTypeId: defaultSolutionTypeId,
          facetId,
        }),
      executeFieldSuggestActionCreator: (facetId: string) =>
        executeCommerceFieldSuggest({
          solutionTypeId: defaultSolutionTypeId,
          facetId,
        }),
    });

  return {
    ...restOfFacetSearch,
  };
}
