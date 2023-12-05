import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/facets/facet-set/facet-set-actions';
import {
  CoreCommerceFacet,
  CoreCommerceFacetProps,
  RegularFacetValue,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';

/**
 * The `CommerceRegularFacet` controller offers a high-level programming interface for implementing a regular commerce
 * facet UI component.
 */
export interface CommerceRegularFacet
  extends CoreCommerceFacet<RegularFacetValue> {}

export type CommerceRegularFacetBuilder = typeof buildCommerceRegularFacet;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `CommerceRegularFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine The headless commerce engine.
 * @param props The configurable `CommerceRegularFacet` properties used internally.
 * @returns A `CommerceRegularFacet` controller instance.
 * */
export function buildCommerceRegularFacet(
  engine: CommerceEngine,
  props: CoreCommerceFacetProps
): CommerceRegularFacet {
  const coreController = buildCoreCommerceFacet<RegularFacetValue>(engine, {
    options: {
      ...props.options,
      toggleSelectActionCreator: toggleSelectFacetValue,
      toggleExcludeActionCreator: toggleExcludeFacetValue,
    },
  });

  return {
    ...coreController,
  };
}
