import {configuration} from '../../../app/common-reducers';
import {updatePage} from '../../../features/pagination/pagination-actions';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {
  registerSortCriterion,
  updateSortCriterion,
} from '../../../features/sort/sort-actions';
import {sortReducer as sort} from '../../../features/sort/sort-slice';
import {
  buildMockProductListingEngine,
  MockedProductListingEngine,
} from '../../../test/mock-engine-v2';
import {buildMockProductListingState} from '../../../test/mock-product-listing-state';
import {
  buildFieldsSortCriterion,
  buildRelevanceSortCriterion,
  buildSort,
  ProductListingSort,
  SortCriterion,
  SortBy,
  ProductListingSortInitialState,
  SortDirection,
} from './headless-product-listing-sort';

jest.mock('../../../features/sort/sort-actions');
jest.mock('../../../features/product-listing/product-listing-actions');
jest.mock('../../../features/pagination/pagination-actions');

describe('Sort', () => {
  let engine: MockedProductListingEngine;
  let initialState: ProductListingSortInitialState;
  let plSort: ProductListingSort;

  function initSort() {
    plSort = buildSort(engine, {initialState});
  }

  beforeEach(() => {
    initialState = {};
    engine = buildMockProductListingEngine(buildMockProductListingState());
    initSort();
  });

  it('initializes', () => {
    expect(plSort).toBeTruthy();
  });

  it('#sortBy dispatches #fetchProductListing', () => {
    plSort.sortBy({by: SortBy.Relevance});
    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      sort,
    });
  });

  it('when the #criterion option is not specified, it does not dispatch a registration action', () => {
    expect(registerSortCriterion).not.toHaveBeenCalled();
  });

  it('when #criterion is an invalid value, it throws an error', () => {
    initialState.criterion = '1' as unknown as SortCriterion;
    expect(() => initSort()).toThrow('Check the initialState of buildSort');
  });

  it('when the #criterion option is specified, it dispatches a registration action', () => {
    initialState.criterion = buildRelevanceSortCriterion();
    initSort();

    expect(registerSortCriterion).toHaveBeenCalledWith(initialState.criterion);
  });

  it('when the #criterion is an array, it dispatches a registration action', () => {
    initialState.criterion = buildFieldsSortCriterion([
      {
        name: 'author',
        direction: SortDirection.Ascending,
      },
    ]);
    initSort();

    expect(registerSortCriterion).toHaveBeenCalledWith(initialState.criterion);
  });

  describe('when calling #sortBy with a criterion', () => {
    const criterion = buildFieldsSortCriterion([
      {
        name: 'author',
        direction: SortDirection.Ascending,
      },
    ]);

    beforeEach(() => {
      plSort.sortBy(criterion);
    });

    it('dispatches an updateProductListingSortCriterion action with the passed criterion', () => {
      expect(updateSortCriterion).toHaveBeenCalled();
    });

    it('updates the page to the first one', () => {
      expect(updatePage).toHaveBeenCalled();
    });
  });

  describe('when the store #sortCriteria is set', () => {
    const criterionInState = buildFieldsSortCriterion([
      {
        name: 'author',
        direction: SortDirection.Ascending,
      },
    ]);

    beforeEach(() => {
      const state = buildMockProductListingState({
        sort: criterionInState,
      });
      engine = buildMockProductListingEngine(state);
      initSort();
    });

    it('calling #state returns the sortCriteria expression', () => {
      expect(plSort.state).toEqual({sort: criterionInState});
    });

    it('calling #isSortedBy with a criterion equal to the one in state returns true', () => {
      expect(plSort.isSortedBy(criterionInState)).toBe(true);
    });

    it('calling #isSortedBy with a criterion not equal to the one in state returns false', () => {
      const criterionNotInState = buildRelevanceSortCriterion();
      expect(plSort.isSortedBy(criterionNotInState)).toBe(false);
    });
  });
});
