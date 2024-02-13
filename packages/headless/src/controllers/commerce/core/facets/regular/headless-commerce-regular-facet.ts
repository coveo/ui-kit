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
  CommerceSearchableFacet,
  CommerceSearchableFacetOptions,
  buildCommerceSearchableFacet,
} from '../searchable/headless-commerce-searchable-facet';

export type CommerceRegularFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleSelectActionCreator' | 'toggleExcludeActionCreator'
> &
  CommerceSearchableFacetOptions;

/**
 * The `CommerceRegularFacet` controller offers a high-level programming interface for implementing a regular commerce
 * facet UI component.
 */
export type CommerceRegularFacet = CommerceSearchableFacet<
  FacetValueRequest,
  RegularFacetValue
>;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `CommerceRegularFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `CommerceRegularFacet` options used internally.
 * @returns A `CommerceRegularFacet` controller instance.
 * */
export function buildCommerceRegularFacet(
  engine: CommerceEngine,
  options: CommerceRegularFacetOptions
): CommerceRegularFacet {
  return buildCommerceSearchableFacet<FacetValueRequest, RegularFacetValue>(
    engine,
    {
      ...options,
      toggleSelectActionCreator: toggleSelectFacetValue,
      toggleExcludeActionCreator: toggleExcludeFacetValue,
    }
  );
}
