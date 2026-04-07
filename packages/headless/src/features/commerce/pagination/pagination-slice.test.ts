import {buildSearchResponse} from '../../../test/mock-commerce-search.js';
import {buildFetchProductListingResponse} from '../../../test/mock-product-listing.js';
import {buildMockRecommendationsResponse} from '../../../test/mock-recommendations.js';
import {setContext, setView} from '../context/context-actions.js';
import {toggleSelectCategoryFacetValue} from '../facets/category-facet/category-facet-actions.js';
import {
  clearAllCoreFacets,
  deselectAllValuesInCoreFacet,
} from '../facets/core-facet/core-facet-actions.js';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../facets/date-facet/date-facet-actions.js';
import {toggleSelectLocationFacetValue} from '../facets/location-facet/location-facet-actions.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../facets/numeric-facet/numeric-facet-actions.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../facets/regular-facet/regular-facet-actions.js';
import {fetchProductListing} from '../product-listing/product-listing-actions.js';
import {restoreProductListingParameters} from '../product-listing-parameters/product-listing-parameters-actions.js';
import {fetchRecommendations} from '../recommendations/recommendations-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameters-actions.js';
import {applySort} from '../sort/sort-actions.js';
import {
  nextPage,
  previousPage,
  registerRecommendationsSlotPagination,
  selectPage,
  setPageSize,
} from './pagination-actions.js';
import {paginationReducer} from './pagination-slice.js';
import {
  type CommercePaginationState,
  getCommercePaginationInitialSlice,
  getCommercePaginationInitialState,
  type PaginationSlice,
} from './pagination-state.js';

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

      it('#setPageSize resets page to 0', () => {
        const pageSize = 17;
        const finalState = paginationReducer(
          state,
          setPageSize({
            ...slotParams,
            pageSize,
          })
        );

        expect(getSlice(finalState)!.perPage).toBe(pageSize);
        expect(getSlice(finalState)!.page).toBe(0);
      });
    }
  );

  it('sets the principal pagination on #fetchProductListing.fulfilled', () => {
    const response = buildFetchProductListingResponse({
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

    it('restores principal pagination page to initial state when page parameter is undefined', () => {
      const parameters = {
        page: undefined,
        perPage: undefined,
      };

      const finalState = paginationReducer(state, action(parameters));

      expect(finalState.principal.page).toEqual(
        getCommercePaginationInitialState().principal.page
      );
    });

    it('does not restore principal pagination perPage when perPage parameter is undefined', () => {
      const parameters = {
        page: undefined,
        perPage: undefined,
      };

      const finalState = paginationReducer(state, action(parameters));

      expect(finalState.principal.perPage).toEqual(state.principal.perPage);
    });
  });

  describe.each([
    {
      actionName: '#clearAllCoreFacets',
      action: clearAllCoreFacets,
    },
    {
      actionName: '#deselectAllValuesInCoreFacet',
      action: deselectAllValuesInCoreFacet,
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
      actionName: '#toggleSelectLocationFacetValue',
      action: toggleSelectLocationFacetValue,
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
      actionName: '#toggleSelectDateFacetValue',
      action: toggleSelectDateFacetValue,
    },
    {
      actionName: '#toggleExcludeDateFacetValue',
      action: toggleExcludeDateFacetValue,
    },
    {
      actionName: '#toggleSelectCategoryFacetValue',
      action: toggleSelectCategoryFacetValue,
    },
    {
      actionName: '#applySort',
      action: applySort,
    },
    {
      actionName: '#setContext',
      action: setContext,
    },
    {
      actionName: '#setView',
      action: setView,
    },
  ])('$actionName', ({action}) => {
    it('resets principal pagination', () => {
      state.principal.page = 5;

      const finalState = paginationReducer(state, action({} as never));

      expect(finalState.principal.page).toBe(0);
    });
  });

  describe('#registerRecommendationsSlotPagination', () => {
    it('when slot id is not already registered, registers the slot', () => {
      const finalState = paginationReducer(
        state,
        registerRecommendationsSlotPagination({slotId})
      );

      expect(finalState.recommendations[slotId]).toEqual(
        getCommercePaginationInitialSlice()
      );
    });

    it('when slot id is already registered, does not register the slot', () => {
      const recommendation = {
        page: 5,
        perPage: 3,
        totalEntries: 35,
        totalPages: 12,
      };
      state.recommendations[slotId] = recommendation;

      const finalState = paginationReducer(
        state,
        registerRecommendationsSlotPagination({slotId})
      );

      expect(finalState.recommendations[slotId]).toEqual(recommendation);
    });
  });
});
