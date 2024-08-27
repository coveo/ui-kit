import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../../app/state-key';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/commerce/facets/regular-facet/regular-facet-actions';
import {specificFacetSearchStateSelector} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-state-selector';
import {
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  CoreCommerceFacetState,
  FacetControllerType,
  FacetValueRequest,
  RegularFacetValue,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';
import {SearchableFacetOptions} from '../searchable/headless-commerce-searchable-facet';
import {
  RegularFacetSearch,
  RegularFacetSearchState,
  buildRegularFacetSearch,
} from './headless-commerce-regular-facet-search';

export type RegularFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleSelectActionCreator' | 'toggleExcludeActionCreator'
> &
  SearchableFacetOptions;

export type RegularFacetState = Omit<
  CoreCommerceFacetState<RegularFacetValue>,
  'type'
> & {
  facetSearch: RegularFacetSearchState;
  type: 'regular';
};

/**
 * The `RegularFacet` sub-controller offers a high-level programming interface for implementing a regular commerce
 * facet UI component.
 */
export type RegularFacet = CoreCommerceFacet<
  FacetValueRequest,
  RegularFacetValue
> & {
  facetSearch: Omit<RegularFacetSearch, 'state'>;
  state: RegularFacetState;
} & FacetControllerType<'regular'>;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `RegularFacet` sub-controller instances through the state of a `FacetGenerator`
 * sub-controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `RegularFacet` options used internally.
 * @returns A `RegularFacet` sub-controller instance.
 * */
export function buildCommerceRegularFacet(
  engine: CommerceEngine,
  options: RegularFacetOptions
): RegularFacet {
  const coreController = buildCoreCommerceFacet<
    FacetValueRequest,
    RegularFacetValue
  >(engine, {
    options: {
      ...options,
      toggleSelectActionCreator: toggleSelectFacetValue,
      toggleExcludeActionCreator: toggleExcludeFacetValue,
    },
  });
  const getFacetId = () => coreController.state.facetId;
  const {dispatch} = engine;

  const facetSearch = buildRegularFacetSearch(engine, {
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
      return getRegularFacetState(
        coreController.state,
        specificFacetSearchStateSelector(engine[stateKey], getFacetId())
      );
    },

    type: 'regular',
  };
}

export const getRegularFacetState = (
  coreState: CoreCommerceFacetState<RegularFacetValue>,
  facetSearchSelector: ReturnType<typeof specificFacetSearchStateSelector>
): RegularFacetState => {
  return {
    ...coreState,
    facetSearch: {
      isLoading: facetSearchSelector?.isLoading ?? false,
      moreValuesAvailable:
        facetSearchSelector?.response.moreValuesAvailable ?? false,
      query: facetSearchSelector?.options.query ?? '',
      values: facetSearchSelector?.response.values ?? [],
    },
    type: 'regular',
  };
};
