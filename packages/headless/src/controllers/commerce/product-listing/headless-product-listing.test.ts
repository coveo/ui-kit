import {Action} from '@reduxjs/toolkit';
import {configuration} from '../../../app/common-reducers';
import {
  fetchProductListing,
  setProductListingUrl,
} from '../../../features/product-listing/v2/product-listing-v2-actions';
import {productListingV2Reducer} from '../../../features/product-listing/v2/product-listing-v2-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../test';
import {
  buildProductListing,
  ProductListing,
  ProductListingOptions,
} from './headless-product-listing';

describe('headless product-listing', () => {
  let productListing: ProductListing;
  let engine: MockCommerceEngine;

  const baseOptions: ProductListingOptions = {
    url: 'https://someurl.com',
  };

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    productListing = buildProductListing(engine, {
      options: baseOptions,
    });
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing: productListingV2Reducer,
      configuration,
    });
  });

  it('dispatches #setProductListingUrl on load', () => {
    expectContainAction(setProductListingUrl);
  });

  it('setUrl dispatches #setProductListingUrl', () => {
    productListing.setUrl('http://example.org');
    expectContainAction(setProductListingUrl);
  });

  it('refresh dispatches #fetchProductListing', () => {
    productListing.refresh();
    expectContainAction(fetchProductListing.pending);
  });
});
