import type {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine.js';
import type {LocationFacetValue} from '../../../../../features/commerce/facets/facet-set/interfaces/response.js';
import {toggleSelectLocationFacetValue} from '../../../../../features/commerce/facets/location-facet/location-facet-actions.js';
import {
  buildCoreCommerceFacet,
  type CoreCommerceFacet,
  type CoreCommerceFacetOptions,
  type CoreCommerceFacetState,
  type FacetControllerType,
  type FacetValueRequest,
} from '../headless-core-commerce-facet.js';

/**
 * @group Sub-controllers
 * @category LocationFacet
 */
export type LocationFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleSelectActionCreator' | 'toggleExcludeActionCreator'
>;

/**
 * @group Sub-controllers
 * @category LocationFacet
 */
export type LocationFacetState = Omit<
  CoreCommerceFacetState<LocationFacetValue>,
  'type'
> & {
  type: 'location';
};

/**
 * The `LocationFacet` sub-controller offers a high-level programming interface for implementing a location commerce
 * facet UI component.
 *
 * @group Sub-controllers
 * @category LocationFacet
 */
export type LocationFacet = Omit<
  CoreCommerceFacet<FacetValueRequest, LocationFacetValue>,
  'isValueExcluded' | 'toggleExclude' | 'toggleSingleExclude'
> & {
  state: LocationFacetState;
} & FacetControllerType<'location'>;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `LocationFacet` sub-controller instances through the state of a `FacetGenerator`
 * sub-controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `LocationFacet` options used internally.
 * @returns A `LocationFacet` sub-controller instance.
 * */
export function buildCommerceLocationFacet(
  engine: CommerceEngine,
  options: LocationFacetOptions
): LocationFacet {
  const {
    toggleSingleExclude: _toggleSingleExclude,
    toggleExclude: _toggleExclude,
    isValueExcluded: _isValueExcluded,
    ...coreController
  } = buildCoreCommerceFacet<FacetValueRequest, LocationFacetValue>(engine, {
    options: {
      ...options,
      toggleSelectActionCreator: toggleSelectLocationFacetValue,
    },
  });

  return {
    ...coreController,

    get state() {
      return getLocationFacetState(coreController.state);
    },

    type: 'location',
  };
}

export const getLocationFacetState = (
  coreState: CoreCommerceFacetState<LocationFacetValue>
): LocationFacetState => {
  return {
    ...coreState,
    type: 'location',
  };
};
