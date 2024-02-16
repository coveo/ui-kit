import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
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
  CommerceFacetSearch,
  buildCommerceFacetSearch,
} from './headless-commerce-facet-search';

export type CommerceFacetSearchState = FacetSearchState;

export type CommerceSearchableFacet<
  ValueRequest extends AnyFacetValueRequest,
  ValueResponse extends AnyFacetValueResponse,
> = CoreCommerceFacet<ValueRequest, ValueResponse> & {
  /**
   * The facet search controller.
   */
  facetSearch: Omit<CommerceFacetSearch, 'state'>;
  state: CoreCommerceFacetState<ValueResponse> & {
    /**
     * The facet search state.
     */
    facetSearch: CommerceFacetSearchState;
  };
};

export type CommerceSearchableFacetOptions = {
  facetSearch?: {facetQuery: string};
};

export function buildCommerceSearchableFacet<
  ValueRequest extends AnyFacetValueRequest,
  ValueResponse extends AnyFacetValueResponse,
>(
  engine: CommerceEngine,
  options: CoreCommerceFacetOptions & CommerceSearchableFacetOptions
): CommerceSearchableFacet<ValueRequest, ValueResponse> {
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
  const getFacetSearchState = () => engine.state.facetSearchSet[getFacetId()];

  return {
    ...coreController,
    facetSearch: restOfFacetSearch,

    get state() {
      const facetSearchState = getFacetSearchState();
      return {
        ...coreController.state,
        facetSearch: {
          isLoading: facetSearchState.isLoading,
          moreValuesAvailable: facetSearchState.response.moreValuesAvailable,
          query: facetSearchState.options.query,
          values: facetSearchState.response.values,
        },
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
