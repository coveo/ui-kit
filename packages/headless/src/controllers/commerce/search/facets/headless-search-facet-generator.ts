import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  buildCommerceFacetGenerator,
  CommerceFacetGenerator,
} from '../../facets/core/generator/headless-commerce-facet-generator';
import {buildSearchCategoryFacet} from './headless-search-category-facet';
import {buildSearchDateFacet} from './headless-search-date-facet';
import {buildSearchNumericFacet} from './headless-search-numeric-facet';
import {buildSearchRegularFacet} from './headless-search-regular-facet';

/**
 * The `SearchFacetGenerator` headless controller creates commerce facet controllers from Commerce API
 * search responses.
 *
 * Commerce facets are not requested by the implementer, but rather pre-configured through the Coveo Merchandising Hub
 * (CMH). The implementer is only responsible for leveraging the facet controllers created by this controller to
 * properly render facets in their application.
 */
export interface SearchFacetGenerator extends CommerceFacetGenerator {}

/**
 * Creates `SearchFacetGenerator` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `SearchFacetGenerator` controller instance.
 */
export function buildSearchFacetGenerator(
  engine: CommerceEngine
): SearchFacetGenerator {
  return buildCommerceFacetGenerator(engine, {
    buildRegularFacet: buildSearchRegularFacet,
    buildNumericFacet: buildSearchNumericFacet,
    buildDateFacet: buildSearchDateFacet,
    buildCategoryFacet: buildSearchCategoryFacet,
  }) as SearchFacetGenerator;
}
