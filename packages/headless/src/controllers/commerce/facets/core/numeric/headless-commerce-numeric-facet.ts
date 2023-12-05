import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {NumericFacetValue} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {RangeValueRequest} from '../../../../../features/facets/range-facets/generic/interfaces/range-facet';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';

export type CommerceNumericFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleSelectActionCreator' | 'toggleExcludeActionCreator'
>;

/**
 * The `CommerceNumericFacet` controller offers a high-level programming interface for implementing numeric commerce
 * facet UI component.
 */
export interface CommerceNumericFacet
  extends CoreCommerceFacet<RangeValueRequest, NumericFacetValue> {}

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `CommerceNumericFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `CommerceNumericFacet` options used internally.
 * @returns A `CommerceNumericFacet` controller instance.
 */
export function buildCommerceNumericFacet(
  engine: CommerceEngine,
  options: CommerceNumericFacetOptions
): CommerceNumericFacet {
  const coreController = buildCoreCommerceFacet<
    RangeValueRequest,
    NumericFacetValue
  >(engine, {
    options: {
      ...options,
      toggleSelectActionCreator: toggleSelectNumericFacetValue,
      toggleExcludeActionCreator: toggleExcludeNumericFacetValue,
    },
  });

  return {
    ...coreController,
  };
}
