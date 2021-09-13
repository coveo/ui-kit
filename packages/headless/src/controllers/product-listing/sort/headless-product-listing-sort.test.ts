import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../../test';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {
  buildSort,
  ProductListingSort,
  ProductListingSortBy,
  ProductListingSortInitialState,
} from './headless-product-listing-sort';

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
});
