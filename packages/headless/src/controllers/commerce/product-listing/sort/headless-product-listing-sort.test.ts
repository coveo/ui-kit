import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer} from '../../../../features/commerce/product-listing/product-listing-slice';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {
  buildRelevanceSortCriterion,
  Sort,
} from '../../core/sort/headless-core-commerce-sort';
import {buildProductListingSort} from './headless-product-listing-sort';

jest.mock(
  '../../../../features/commerce/product-listing/product-listing-actions'
);

describe('headless product listing sort', () => {
  let sort: Sort;
  let engine: MockedCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    sort = buildProductListingSort(engine);
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing: productListingV2Reducer,
    });
  });

  it('#sortBy dispatches #fetchProductListing', () => {
    sort.sortBy(buildRelevanceSortCriterion());
    expect(fetchProductListing).toHaveBeenCalled();
  });
});
