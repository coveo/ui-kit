import {Action} from '@reduxjs/toolkit';
import {configuration} from '../../../app/common-reducers';
import {
  fetchProductListing
} from '../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer} from '../../../features/commerce/product-listing/product-listing-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../test';
import {
  buildProductListing,
  ProductListing,
} from './headless-product-listing';
import {contextReducer} from '../../../features/commerce/context/context-slice';

describe('headless product-listing', () => {
  let productListing: ProductListing;
  let engine: MockCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    productListing = buildProductListing(engine);
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing: productListingV2Reducer,
      commerceContext: contextReducer,
      configuration,
    });
  });

  it('refresh dispatches #fetchProductListing', () => {
    productListing.refresh();
    expectContainAction(fetchProductListing.pending);
  });
});
