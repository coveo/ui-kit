import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../../test';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
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
import {configuration, sort} from '../../../app/reducers';
import {
  registerSortCriterion,
  updateSortCriterion,
} from '../../../features/sort/sort-actions';
import {updatePage} from '../../../features/pagination/pagination-actions';
import {buildMockProductListingState} from '../../../test/mock-product-listing-state';

describe('Sort', () => {
  let engine: MockProductListingEngine;
  let initialState: ProductListingSortInitialState;
  let plSort: ProductListingSort;

  function initSort() {
    plSort = buildSort(engine, {initialState});
  }

  beforeEach(() => {
    initialState = {};
    engine = buildMockProductListingEngine();
    initSort();
  });

  it('initializes', () => {
    expect(plSort).toBeTruthy();
  });

  it('#sortBy dispatches #fetchProductListing', () => {
    plSort.sortBy({by: SortBy.Relevance});
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      sort,
    });
  });

  it('when the #criterion option is not specified, it does not dispatch a registration action', () => {
    const action = engine.actions.find(
      (a) => a.type === registerSortCriterion.type
    );
    expect(action).toBe(undefined);
  });

  it('when #criterion is an invalid value, it throws an error', () => {
    initialState.criterion = '1' as unknown as SortCriterion;
    expect(() => initSort()).toThrow('Check the initialState of buildSort');
  });

  it('when the #criterion option is specified, it dispatches a registration action', () => {
    initialState.criterion = buildRelevanceSortCriterion();
    initSort();

    expect(engine.actions).toContainEqual(
      registerSortCriterion(initialState.criterion)
    );
  });

  it('when the #criterion is an array, it dispatches a registration action', () => {
    initialState.criterion = buildFieldsSortCriterion([
      {
        name: 'author',
        direction: SortDirection.Ascending,
      },
    ]);
    initSort();

    expect(engine.actions).toContainEqual(
      registerSortCriterion(initialState.criterion)
    );
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
      const action = updateSortCriterion(criterion);
      expect(engine.actions).toContainEqual(action);
    });

    it('updates the page to the first one', () => {
      expect(engine.actions).toContainEqual(updatePage(1));
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
      engine = buildMockProductListingEngine({state});
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
