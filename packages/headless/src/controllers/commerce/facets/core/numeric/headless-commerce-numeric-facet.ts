import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {
  CoreCommerceFacet,
  CoreCommerceFacetProps,
  NumericFacetValue,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';

/**
 * The `CommerceNumericFacet` controller offers a high-level programming interface for implementing numeric commerce
 * facet UI component.
 */
export interface CommerceNumericFacet
  extends CoreCommerceFacet<NumericFacetValue> {}

export type CommerceNumericFacetBuilder = typeof buildCommerceNumericFacet;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `CommerceNumericFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine The headless commerce engine.
 * @param props The configurable `CommerceNumericFacet` properties used internally.
 * @returns A `CommerceNumericFacet` controller instance.
 */
export function buildCommerceNumericFacet(
  engine: CommerceEngine,
  props: CoreCommerceFacetProps
): CommerceNumericFacet {
  const coreController = buildCoreCommerceFacet<NumericFacetValue>(engine, {
    options: {
      ...props.options,
      toggleSelectActionCreator: toggleSelectNumericFacetValue,
      toggleExcludeActionCreator: toggleExcludeNumericFacetValue,
    },
  });

  return {
    ...coreController,
  };
}
