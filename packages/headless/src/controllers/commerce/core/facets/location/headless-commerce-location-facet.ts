import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../../app/state-key.js';
import {LocationFacetValue} from '../../../../../features/commerce/facets/facet-set/interfaces/response.js';
import {
  toggleExcludeLocationFacetValue,
  toggleSelectLocationFacetValue,
} from '../../../../../features/commerce/facets/location-facet/location-facet-actions.js';
import {locationFacetSearchStateSelector} from '../../../../../features/facets/facet-search-set/location/location-facet-search-state-selector.js';
import {
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  CoreCommerceFacetState,
  FacetControllerType,
  FacetValueRequest,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet.js';
import {SearchableFacetOptions} from '../searchable/headless-commerce-searchable-facet.js';
import {
  LocationFacetSearch,
  LocationFacetSearchState,
  buildLocationFacetSearch,
} from './headless-commerce-location-facet-search.js';

export type LocationFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleSelectActionCreator' | 'toggleExcludeActionCreator'
> &
  SearchableFacetOptions;

export type LocationFacetState = Omit<
  CoreCommerceFacetState<LocationFacetValue>,
  'type'
> & {
  facetSearch: LocationFacetSearchState;
  type: 'location';
};

/**
 * The `LocationFacet` sub-controller offers a high-level programming interface for implementing a location commerce
 * facet UI component.
 */
export type LocationFacet = CoreCommerceFacet<
  FacetValueRequest,
  LocationFacetValue
> & {
  facetSearch: Omit<LocationFacetSearch, 'state'>;
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
  const coreController = buildCoreCommerceFacet<
    FacetValueRequest,
    LocationFacetValue
  >(engine, {
    options: {
      ...options,
      toggleSelectActionCreator: toggleSelectLocationFacetValue,
      toggleExcludeActionCreator: toggleExcludeLocationFacetValue,
    },
  });
  const getFacetId = () => coreController.state.facetId;
  const {dispatch} = engine;

  const facetSearch = buildLocationFacetSearch(engine, {
    options: {facetId: getFacetId(), ...options.facetSearch},
    select: () => {
      dispatch(options.fetchProductsActionCreator());
    },
    exclude: () => {
      dispatch(options.fetchProductsActionCreator());
    },
    isForFieldSuggestions: false,
  });

  return {
    ...coreController,
    facetSearch,

    get state() {
      return getLocationFacetState(
        coreController.state,
        locationFacetSearchStateSelector(engine[stateKey], getFacetId())
      );
    },

    type: 'location',
  };
}

export const getLocationFacetState = (
  coreState: CoreCommerceFacetState<LocationFacetValue>,
  facetSearchSelector: ReturnType<typeof locationFacetSearchStateSelector>
): LocationFacetState => {
  return {
    ...coreState,
    facetSearch: {
      isLoading: facetSearchSelector?.isLoading ?? false,
      moreValuesAvailable:
        facetSearchSelector?.response.moreValuesAvailable ?? false,
      query: facetSearchSelector?.options.query ?? '',
      values: facetSearchSelector?.response.values ?? [],
    },
    type: 'location',
  };
};
