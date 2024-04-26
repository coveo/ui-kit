import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../../app/commerce-engine/commerce-engine';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/facets/facet-set/facet-set-actions';
import {
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  CoreCommerceFacetState,
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

export type RegularFacetState = CoreCommerceFacetState<RegularFacetValue> & {
  facetSearch: RegularFacetSearchState;
};

/**
 * The `RegularFacet` controller offers a high-level programming interface for implementing a regular commerce
 * facet UI component.
 */
export type RegularFacet = CoreCommerceFacet<
  FacetValueRequest,
  RegularFacetValue
> & {
  facetSearch: Omit<RegularFacetSearch, 'state'>;
  state: RegularFacetState;
};

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
        dispatch(options.fetchResultsActionCreator());
      },
      exclude: () => {
        dispatch(options.fetchResultsActionCreator());
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
        ...facetSearchStateSelector(engine.state),
      };
    },
  };
}
