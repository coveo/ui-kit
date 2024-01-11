import {buildSearchResponse} from '../../../test/mock-commerce-search';
import {buildFetchProductListingV2Response} from '../../../test/mock-product-listing-v2';
import {SortBy, SortDirection} from '../../sort/sort';
import {setContext, setUser, setView} from '../context/context-actions';
import {fetchProductListing} from '../product-listing/product-listing-actions';
import {executeSearch} from '../search/search-actions';
import {applySort} from './sort-actions';
import {sortReducer} from './sort-slice';
import {CommerceSortState, getCommerceSortInitialState} from './sort-state';

describe('product-listing-sort-slice', () => {
  const sort = {
    by: SortBy.Fields,
    fields: [
      {
        name: 'some_field',
        direction: SortDirection.Descending,
        displayName: 'Some Field',
      },
    ],
  };

  let state: CommerceSortState;
  beforeEach(() => {
    state = getCommerceSortInitialState();
  });

  it('should have an initial state', () => {
    expect(sortReducer(undefined, {type: 'foo'})).toEqual(
      getCommerceSortInitialState()
    );
  });

  it('sets the applied sort', () => {
    expect(sortReducer(state, applySort(sort)).appliedSort).toEqual(sort);
  });

  describe('sets the applied and available sorts', () => {
    const sortByFieldOption = {
      sortCriteria: SortBy.Fields,
      fields: [
        {
          field: 'some_field',
          direction: SortDirection.Descending,
          displayName: 'Some Field',
        },
      ],
    };
    const sortResponse = {
      sort: {
        appliedSort: sortByFieldOption,
        availableSorts: [sortByFieldOption],
      },
    };

    it('on #fetchProductListing.fulfilled', () => {
      const response = buildFetchProductListingV2Response(sortResponse);

      expect(
        sortReducer(state, fetchProductListing.fulfilled(response, ''))
          .appliedSort
      ).toEqual(sort);
      expect(
        sortReducer(state, fetchProductListing.fulfilled(response, ''))
          .availableSorts
      ).toEqual([sort]);
    });

    it('on #executeSearch.fulfilled', () => {
      const response = buildSearchResponse(sortResponse);

      expect(
        sortReducer(state, executeSearch.fulfilled(response, '')).appliedSort
      ).toEqual(sort);
      expect(
        sortReducer(state, executeSearch.fulfilled(response, '')).availableSorts
      ).toEqual([sort]);
    });
  });

  describe.each([
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
    it('resets sort', () => {
      state.appliedSort = sort;
      state.availableSorts = [sort];
      const finalState = sortReducer(state, action);

      expect(finalState).toStrictEqual(getCommerceSortInitialState());
    });
  });
});
