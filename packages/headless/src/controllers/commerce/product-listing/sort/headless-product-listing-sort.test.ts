import {Action} from '@reduxjs/toolkit';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer} from '../../../../features/commerce/product-listing/product-listing-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {
  buildRelevanceSortCriterion,
  Sort,
} from '../../sort/core/headless-core-commerce-sort';
import {buildProductListingSort} from './headless-product-listing-sort';

describe('headless product listing sort', () => {
  let sort: Sort;
  let engine: MockCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    sort = buildProductListingSort(engine);
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing: productListingV2Reducer,
    });
  });

  it('sortBy dispatches #fetchProductListing', () => {
    sort.sortBy(buildRelevanceSortCriterion());
    expectContainAction(fetchProductListing.pending);
  });
});
