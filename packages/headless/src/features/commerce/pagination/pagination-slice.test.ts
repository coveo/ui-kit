import {buildSearchResponse} from '../../../test/mock-commerce-search';
import {buildFetchProductListingV2Response} from '../../../test/mock-product-listing-v2';
import {buildMockRecommendationsResponse} from '../../../test/mock-recommendations';
import {deselectAllBreadcrumbs} from '../../breadcrumb/breadcrumb-actions';
import {
  deselectAllFacetValues,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../facets/facet-set/facet-set-actions';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {setContext, setUser, setView} from '../context/context-actions';
import {restoreProductListingParameters} from '../product-listing-parameters/product-listing-parameters-actions';
import {fetchProductListing} from '../product-listing/product-listing-actions';
import {fetchRecommendations} from '../recommendations/recommendations-actions';
import {restoreSearchParameters} from '../search-parameters/search-parameters-actions';
import {executeSearch} from '../search/search-actions';
import {
  nextPage,
  previousPage,
  selectPage,
  setPageSize,
} from './pagination-actions';
import {paginationReducer} from './pagination-slice';
import {
  CommercePaginationState,
  getCommercePaginationInitialSlice,
  getCommercePaginationInitialState,
  PaginationSlice,
} from './pagination-state';

describe('pagination slice', () => {
  let state: CommercePaginationState;
  const pagination = {
    page: 999,
    perPage: 999,
    totalEntries: 999,
    totalPages: 999,
  };
  const slotId = 'recommendations-slot-id';

  beforeEach(() => {
    state = getCommercePaginationInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = paginationReducer(undefined, {type: ''});
    expect(finalState).toEqual({
      recommendations: {},
      principal: {
        page: 0,
        perPage: 0,
        totalEntries: 0,
        totalPages: 0,
      },
    });
  });

  describe.each([
    {
      name: 'principal',
      getSlice: (state: CommercePaginationState) => state.principal,
      setSlice: (slice: PaginationSlice) => {
        state.principal = slice;
      },
      slotParams: {},
    },
    {
      name: 'recommendation slot',
      getSlice: (state: CommercePaginationState) =>
        state.recommendations[slotId],
      setSlice: (slice: PaginationSlice) => {
        state.recommendations[slotId] = slice;
      },
      slotParams: {
        slotId,
      },
    },
  ])(
    '$name pagination',
    ({
      getSlice,
      setSlice,
      slotParams,
    }: {
      setSlice: (slice: PaginationSlice) => void;
      getSlice: (state: CommercePaginationState) => PaginationSlice | undefined;
      slotParams: {} | {slotId: string};
    }) => {
      beforeEach(() => {
        setSlice(getCommercePaginationInitialSlice());
      });

      it('#selectPage does not update the current page if specified page is invalid', () => {
        getSlice(state)!.totalPages = 1;

        const intermediaryState = paginationReducer(
          state,
          selectPage({
            ...slotParams,
            page: 1,
          })
        );

        expect(getSlice(intermediaryState)!.page).toBe(0);

        const finalState = paginationReducer(
          state,
          selectPage({
            ...slotParams,
            page: -1,
          })
        );

        expect(getSlice(finalState)!.page).toBe(0);
      });

      it('#selectPage updates the current page if valid', () => {
        getSlice(state)!.totalPages = 2;
        const finalState = paginationReducer(
          state,
          selectPage({
            ...slotParams,
            page: 1,
          })
        );

        expect(getSlice(finalState)!.page).toBe(1);
      });

      it('#nextPage does not update the current page if already on the last page', () => {
        getSlice(state)!.totalPages = 2;
        getSlice(state)!.page = 1;
        const finalState = paginationReducer(state, nextPage(slotParams));

        expect(getSlice(finalState)!.page).toBe(1);
      });

      it('#nextPage increments the current page if not already on last page', () => {
        getSlice(state)!.totalPages = 2;
        const finalState = paginationReducer(state, nextPage(slotParams));

        expect(getSlice(finalState)!.page).toBe(1);
      });

      it('#previousPage does not update the current page if already on the first page', () => {
        getSlice(state)!.totalPages = 2;
        const finalState = paginationReducer(state, previousPage(slotParams));

        expect(getSlice(finalState)!.page).toBe(0);
      });

      it('#previousPage decrements the current page if not already on first page', () => {
        getSlice(state)!.totalPages = 2;
        getSlice(state)!.page = 1;
        const finalState = paginationReducer(state, previousPage(slotParams));

        expect(getSlice(finalState)!.page).toBe(0);
      });

      it('#setPageSize sets the page size', () => {
        const pageSize = 17;
        const finalState = paginationReducer(
          state,
          setPageSize({
            ...slotParams,
            pageSize,
          })
        );

        expect(getSlice(finalState)!.perPage).toBe(pageSize);
      });
    }
  );

  it('sets the principal pagination on #fetchProductListing.fulfilled', () => {
    const response = buildFetchProductListingV2Response({
      pagination,
    });

    expect(
      paginationReducer(state, fetchProductListing.fulfilled(response, ''))
        .principal
    ).toEqual(pagination);
  });

  it('sets the principal pagination on #executeSearch.fulfilled', () => {
    const response = buildSearchResponse({
      pagination,
    });

    expect(
      paginationReducer(state, executeSearch.fulfilled(response, '')).principal
    ).toEqual(pagination);
  });

  it('sets the recommendation slot pagination on #fetchRecommendations.fulfilled', () => {
    const response = buildMockRecommendationsResponse({
      pagination,
    });

    expect(
      paginationReducer(
        state,
        fetchRecommendations.fulfilled(response, '', {slotId})
      ).recommendations[slotId]
    ).toEqual(pagination);
  });

  describe.each([
    {
      action: restoreSearchParameters,
      actionName: 'restoreSearchParameters',
    },
    {
      action: restoreProductListingParameters,
      actionName: 'restoreProductListingParameters',
    },
  ])('$actionName', ({action}) => {
    it('restores principal pagination', () => {
      const parameters = {
        page: 2,
        perPage: 11,
      };

      const finalState = paginationReducer(state, action(parameters));

      expect(finalState.principal.page).toBe(parameters.page);
      expect(finalState.principal.perPage).toBe(parameters.perPage);
    });

    it('does not restore principal pagination when parameters are not defined', () => {
      const parameters = {
        page: undefined,
        perPage: undefined,
      };

      const finalState = paginationReducer(state, action(parameters));

      expect(finalState.principal).toBe(state.principal);
    });
  });

  describe.each([
    {
      actionName: '#deselectAllBreadcrumbs',
      action: deselectAllBreadcrumbs,
    },
    {
      actionName: '#deselectAllFacetValues',
      action: deselectAllFacetValues,
    },
    {
      actionName: '#toggleSelectFacetValue',
      action: toggleSelectFacetValue,
    },
    {
      actionName: '#toggleExcludeFacetValue',
      action: toggleExcludeFacetValue,
    },
    {
      actionName: '#toggleSelectNumericFacetValue',
      action: toggleSelectNumericFacetValue,
    },
    {
      actionName: '#toggleExcludeNumericFacetValue',
      action: toggleExcludeNumericFacetValue,
    },
    {
      actionName: '#setContext',
      action: setContext,
    },
    {
      actionName: '#setView',
      action: setView,
    },
    {
      actionName: '#setUser',
      action: setUser,
    },
  ])('$actionName', ({action}) => {
    it('resets principal pagination', () => {
      state.principal.page = 5;

      const finalState = paginationReducer(state, action({} as never));

      expect(finalState.principal.page).toBe(0);
    });
  });
});
