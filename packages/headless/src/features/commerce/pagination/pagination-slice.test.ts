import {buildSearchResponse} from '../../../test/mock-commerce-search';
import {buildFetchProductListingV2Response} from '../../../test/mock-product-listing-v2';
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
import {fetchProductListing} from '../product-listing/product-listing-actions';
import {executeSearch} from '../search/search-actions';
import {nextPage, previousPage, selectPage} from './pagination-actions';
import {paginationReducer} from './pagination-slice';
import {
  CommercePaginationState,
  getCommercePaginationInitialState,
} from './pagination-state';

describe('pagination slice', () => {
  let state: CommercePaginationState;
  const pagination = {
    page: 999,
    perPage: 999,
    totalCount: 999,
    totalPages: 999,
  };

  beforeEach(() => {
    state = getCommercePaginationInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = paginationReducer(undefined, {type: ''});
    expect(finalState).toEqual({
      page: 0,
      perPage: 0,
      totalCount: 0,
      totalPages: 0,
    });
  });

  it('#selectPage does not update the current page if specified page is invalid', () => {
    state.totalPages = 1;

    let finalState = paginationReducer(state, selectPage(1));

    expect(finalState.page).toBe(0);

    finalState = paginationReducer(state, selectPage(-1));

    expect(finalState.page).toBe(0);
  });

  it('#selectPage updates the current page if valid', () => {
    state.totalPages = 2;
    const finalState = paginationReducer(state, selectPage(1));

    expect(finalState.page).toBe(1);
  });

  it('#nextPage does not update the current page if already on the last page', () => {
    state.totalPages = 2;
    state.page = 1;
    const finalState = paginationReducer(state, nextPage());

    expect(finalState.page).toBe(1);
  });

  it('#nextPage increments the current page if not already on last page', () => {
    state.totalPages = 2;
    const finalState = paginationReducer(state, nextPage());

    expect(finalState.page).toBe(1);
  });

  it('#previousPage does not update the current page if already on the first page', () => {
    state.totalPages = 2;
    const finalState = paginationReducer(state, previousPage());

    expect(finalState.page).toBe(0);
  });

  it('#previousPage decrements the current page if not already on first page', () => {
    state.totalPages = 2;
    state.page = 1;
    const finalState = paginationReducer(state, previousPage());

    expect(finalState.page).toBe(0);
  });

  it('sets the pagination on #fetchProductListing.fulfilled', () => {
    const response = buildFetchProductListingV2Response({
      pagination,
    });

    expect(
      paginationReducer(state, fetchProductListing.fulfilled(response, ''))
    ).toEqual(pagination);
  });

  it('sets the pagination on product #executeSearch.fulfilled', () => {
    const response = buildSearchResponse({
      pagination,
    });

    expect(
      paginationReducer(state, executeSearch.fulfilled(response, ''))
    ).toEqual(pagination);
  });

  describe.each([
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
    it('resets pagination', () => {
      state.page = 5;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalState = paginationReducer(state, action({} as any));

      expect(finalState.page).toBe(0);
    });
  });
});
