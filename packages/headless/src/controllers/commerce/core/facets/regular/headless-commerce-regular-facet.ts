import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../../app/state-key';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/commerce/facets/regular-facet/regular-facet-actions';
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

export interface RegularFacetOptions
  extends Omit<
      CoreCommerceFacetOptions,
      'toggleSelectActionCreator' | 'toggleExcludeActionCreator'
    >,
    SearchableFacetOptions {}

/**
 * @group Generated controllers
 * @category RegularFacet
 */
export interface RegularFacetState
  extends CoreCommerceFacetState<RegularFacetValue> {
  facetSearch: RegularFacetSearchState;
}

/**
 * The `RegularFacet` sub-controller offers a high-level programming interface for implementing a regular commerce
 * facet UI component.
 *
 * @group Generated controllers
 * @category RegularFacet
 */
export interface RegularFacet
  extends CoreCommerceFacet<FacetValueRequest, RegularFacetValue>,
    FacetControllerType<'regular'> {
  facetSearch: Omit<RegularFacetSearch, 'state'>;
  state: RegularFacetState;
}

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
  const createFacetSearch = () => {
    return buildRegularFacetSearch(engine, {
      options: {facetId: getFacetId(), ...options.facetSearch},
      select: () => {
        dispatch(options.fetchProductsActionCreator());
      },
      exclude: () => {
        dispatch(options.fetchProductsActionCreator());
      },
      isForFieldSuggestions: false,
    });
  };

  const facetSearch = createFacetSearch();
  const {state, ...restOfFacetSearch} = facetSearch;
  const facetSearchStateSelector = createSelector(
    (state: CommerceEngineState) => state.facetSearchSet[getFacetId()],
    (facetSearch) => ({
      facetSearch: {
        isLoading: facetSearch.isLoading,
        moreValuesAvailable: facetSearch.response.moreValuesAvailable,
        query: facetSearch.options.query,
        values: facetSearch.response.values,
      },
    })
  );

  return {
    ...coreController,
    facetSearch: restOfFacetSearch,

    get state() {
      return {
        ...coreController.state,
        ...facetSearchStateSelector(engine[stateKey]),
      };
    },

    type: 'regular',
  };
}
