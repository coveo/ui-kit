import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../../app/commerce-engine/commerce-engine';
import {AnyFacetValueResponse} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {AnyFacetValueRequest} from '../../../../../features/facets/generic/interfaces/generic-facet-request';
import {FacetSearchSection} from '../../../../../state/state-sections';
import {loadReducerError} from '../../../../../utils/errors';
import {FacetSearchState} from '../../../../core/facets/facet/headless-core-facet';
import {
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  CoreCommerceFacetState,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';
import {
  FacetSearch,
  buildCommerceFacetSearch,
} from './headless-commerce-facet-search';

export type {FacetSearchState};

export type SearchableFacet<
  ValueRequest extends AnyFacetValueRequest,
  ValueResponse extends AnyFacetValueResponse,
> = CoreCommerceFacet<ValueRequest, ValueResponse> & {
  /**
   * The facet search controller.
   */
  facetSearch: Omit<FacetSearch, 'state'>;
  state: CoreCommerceFacetState<ValueResponse> & {
    /**
     * The facet search state.
     */
    facetSearch: FacetSearchState;
  };
};

export type SearchableFacetOptions = {
  facetSearch?: {facetQuery: string};
};

export function buildCommerceSearchableFacet<
  ValueRequest extends AnyFacetValueRequest,
  ValueResponse extends AnyFacetValueResponse,
>(
  engine: CommerceEngine,
  options: CoreCommerceFacetOptions & SearchableFacetOptions
): SearchableFacet<ValueRequest, ValueResponse> {
  if (!loadSearchableFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;

  const {facetSearch: facetSearchOptions, ...restOfOptions} = options;
  const coreController = buildCoreCommerceFacet<ValueRequest, ValueResponse>(
    engine,
    {
      options: {
        ...restOfOptions,
        toggleSelectActionCreator: options.toggleSelectActionCreator,
        toggleExcludeActionCreator: options.toggleExcludeActionCreator,
      },
    }
  );

  const getFacetId = () => coreController.state.facetId;

  const createFacetSearch = () => {
    return buildCommerceFacetSearch(engine, {
      options: {facetId: getFacetId(), ...facetSearchOptions},
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

function loadSearchableFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FacetSearchSection> {
  engine.addReducers({facetSearchSet});
  return true;
}
