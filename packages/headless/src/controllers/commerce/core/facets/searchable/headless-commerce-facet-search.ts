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

// TODO: Add JSDoc; it's not getting resolved from the annotations in the generic facet search controller.
export type CommerceFacetSearch = ReturnType<typeof buildCommerceFacetSearch>;

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
