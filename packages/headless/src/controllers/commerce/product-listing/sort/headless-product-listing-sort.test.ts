import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer} from '../../../../features/commerce/product-listing/product-listing-slice';
import {MockCommerceEngine} from '../../../../test/mock-engine';
import {buildMockCommerceEngine} from '../../../../test/mock-engine';
import {
  buildRelevanceSortCriterion,
  Sort,
} from '../../core/sort/headless-core-commerce-sort';
import {buildProductListingSort} from './headless-product-listing-sort';

describe('headless product listing sort', () => {
  let sort: Sort;
  let engine: MockCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    sort = buildProductListingSort(engine);
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing: productListingV2Reducer,
    });
  });

  it('#sortBy dispatches #fetchProductListing', () => {
    sort.sortBy(buildRelevanceSortCriterion());
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });
});
