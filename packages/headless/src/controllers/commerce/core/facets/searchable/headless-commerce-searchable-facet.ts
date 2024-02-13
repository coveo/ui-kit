import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {AnyFacetValueResponse} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {AnyFacetValueRequest} from '../../../../../features/facets/generic/interfaces/generic-facet-request';
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

export type CommerceSearchableFacet<
  ValueRequest extends AnyFacetValueRequest,
  ValueResponse extends AnyFacetValueResponse,
> = CoreCommerceFacet<ValueRequest, ValueResponse> & {
  facetSearch: Omit<CommerceFacetSearch, 'state'>;
  state: CoreCommerceFacetState<ValueResponse> & {
    facetSearch: FacetSearchState;
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
  const {dispatch} = engine;

  const {facetSearch, ...restOfOptions} = options;
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
      options: {facetId: getFacetId(), ...facetSearch},
      select: () => {
        dispatch(options.fetchResultsActionCreator());
      },
      exclude: () => {
        dispatch(options.fetchResultsActionCreator());
      },
      isForFieldSuggestions: false,
      executeFacetSearchActionCreator: executeCommerceFacetSearch,
      executeFieldSuggestActionCreator: executeCommerceFieldSuggest,
    });
  };

  const facetSearchController = createFacetSearch();
  const {state, ...restOfFacetSearchController} = facetSearchController;

  return {
    ...coreController,
    facetSearch: restOfFacetSearchController,

    get state() {
      return {
        ...coreController.state,
        facetSearch: state,
      };
    },
  };
}
