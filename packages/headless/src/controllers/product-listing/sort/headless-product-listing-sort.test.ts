import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../../test';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {SortInitialState} from '../../core/sort/headless-core-sort';
import {buildSort, Sort} from './headless-product-listing-sort';
import {SortBy} from '../../../features/sort-criteria/criteria';

describe('Sort', () => {
  let engine: MockProductListingEngine;
  let initialState: SortInitialState;
  let sort: Sort;

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
    sort.sortBy({by: SortBy.NoSort});
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });
});
