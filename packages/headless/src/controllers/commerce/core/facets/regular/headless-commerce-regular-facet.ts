import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/facets/facet-set/facet-set-actions';
import {
  CoreCommerceFacetOptions,
  FacetValueRequest,
  RegularFacetValue,
} from '../headless-core-commerce-facet';
import {
  SearchableFacet,
  SearchableFacetOptions,
  buildCommerceSearchableFacet,
} from '../searchable/headless-commerce-searchable-facet';

export type RegularFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleSelectActionCreator' | 'toggleExcludeActionCreator'
> &
  SearchableFacetOptions;

/**
 * The `RegularFacet` controller offers a high-level programming interface for implementing a regular commerce
 * facet UI component.
 */
export type RegularFacet = SearchableFacet<
  FacetValueRequest,
  RegularFacetValue
>;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `RegularFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `RegularFacet` options used internally.
 * @returns A `RegularFacet` controller instance.
 * */
export function buildCommerceRegularFacet(
  engine: CommerceEngine,
  options: RegularFacetOptions
): RegularFacet {
  return buildCommerceSearchableFacet<FacetValueRequest, RegularFacetValue>(
    engine,
    {
      ...options,
      toggleSelectActionCreator: toggleSelectFacetValue,
      toggleExcludeActionCreator: toggleExcludeFacetValue,
    }
  );
}
