import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../../test';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {
  buildProductListingFieldsSortCriterion,
  buildProductListingRelevanceSortCriterion,
  buildSort,
  ProductListingSort,
  ProductListingSortBy,
  ProductListingSortCriterion,
  ProductListingSortDirection,
  ProductListingSortInitialState,
} from './headless-product-listing-sort';
import {configuration, productListingSort} from '../../../app/reducers';
import {
  registerProductListingSortCriterion,
  updateProductListingSortCriterion,
} from '../../../features/product-listing/product-listing-sort-actions';
import {updatePage} from '../../../features/pagination/pagination-actions';
import {buildMockProductListingState} from '../../../test/mock-product-listing-state';

describe('Sort', () => {
  let engine: MockProductListingEngine;
  let initialState: ProductListingSortInitialState;
  let sort: ProductListingSort;

  function initSort() {
    sort = buildSort(engine, {initialState});
  }

  beforeEach(() => {
    initialState = {};
    engine = buildMockProductListingEngine();
    initSort();
  });

  it('initializes', () => {
    expect(sort).toBeTruthy();
  });

  it('#sortBy dispatches #fetchProductListing', () => {
    sort.sortBy({by: ProductListingSortBy.Relevance});
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      productListingSort,
    });
  });

  it('when the #criterion option is not specified, it does not dispatch a registration action', () => {
    const action = engine.actions.find(
      (a) => a.type === registerProductListingSortCriterion.type
    );
    expect(action).toBe(undefined);
  });

  it('when #criterion is an invalid value, it throws an error', () => {
    initialState.criterion = ('1' as unknown) as ProductListingSortCriterion;
    expect(() => initSort()).toThrow('Check the initialState of buildSort');
  });

  it('when the #criterion option is specified, it dispatches a registration action', () => {
    initialState.criterion = buildProductListingRelevanceSortCriterion();
    initSort();

    expect(engine.actions).toContainEqual(
      registerProductListingSortCriterion(initialState.criterion)
    );
  });

  it('when the #criterion is an array, it dispatches a registration action', () => {
    initialState.criterion = buildProductListingFieldsSortCriterion([
      {
        name: 'author',
        direction: ProductListingSortDirection.Ascending,
      },
    ]);
    initSort();

    expect(engine.actions).toContainEqual(
      registerProductListingSortCriterion(initialState.criterion)
    );
  });

  describe('when calling #sortBy with a criterion', () => {
    const criterion = buildProductListingFieldsSortCriterion([
      {
        name: 'author',
        direction: ProductListingSortDirection.Ascending,
      },
    ]);

    beforeEach(() => {
      sort.sortBy(criterion);
    });

    it('dispatches an updateProductListingSortCriterion action with the passed criterion', () => {
      const action = updateProductListingSortCriterion(criterion);
      expect(engine.actions).toContainEqual(action);
    });

    it('updates the page to the first one', () => {
      expect(engine.actions).toContainEqual(updatePage(1));
    });
  });

  describe('when the store #sortCriteria is set', () => {
    const criterionInState = buildProductListingFieldsSortCriterion([
      {
        name: 'author',
        direction: ProductListingSortDirection.Ascending,
      },
    ]);

    beforeEach(() => {
      const state = buildMockProductListingState({
        productListingSort: criterionInState,
      });
      engine = buildMockProductListingEngine({state});
      initSort();
    });

    it('calling #state returns the sortCriteria expression', () => {
      expect(sort.state).toEqual({productListingSort: criterionInState});
    });

    it('calling #isSortedBy with a criterion equal to the one in state returns true', () => {
      expect(sort.isSortedBy(criterionInState)).toBe(true);
    });

    it('calling #isSortedBy with a criterion not equal to the one in state returns false', () => {
      const criterionNotInState = buildProductListingRelevanceSortCriterion();
      expect(sort.isSortedBy(criterionNotInState)).toBe(false);
    });
  });
});
