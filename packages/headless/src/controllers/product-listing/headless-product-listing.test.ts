import {Action} from '@reduxjs/toolkit';
import {configuration} from '../../app/common-reducers.js';
import {
  fetchProductListing,
  setAdditionalFields,
  setProductListingUrl,
} from '../../features/product-listing/product-listing-actions.js';
import {productListingReducer} from '../../features/product-listing/product-listing-slice.js';
import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../test/mock-engine.js';
import {
  buildProductListing,
  ProductListing,
  ProductListingOptions,
} from './headless-product-listing.js';

describe('headless product-listing', () => {
  let productListing: ProductListing;
  let engine: MockProductListingEngine;

  const baseOptions: ProductListingOptions = {
    url: 'https://someurl.com',
  };

  beforeEach(() => {
    engine = buildMockProductListingEngine();
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
      productListing: productListingReducer,
      configuration,
    });
  });

  it('dispatches #setProductListingUrl on load', () => {
    expectContainAction(setProductListingUrl);
  });

  it('dispatches #setAdditionalFields on load if additionalFields is defined', () => {
    productListing = buildProductListing(engine, {
      options: {
        ...baseOptions,
        additionalFields: ['afield'],
      },
    });
    expectContainAction(setAdditionalFields);
  });

  it('setUrl dispatches #setProductListingUrl', () => {
    productListing.setUrl('http://bloup.🐟️');
    expectContainAction(setProductListingUrl);
  });

  it('refresh dispatches #fetchProductListing', () => {
    productListing.refresh();
    expectContainAction(fetchProductListing.pending);
  });

  it('dispatches #setAdditionalFields on load if additionalFields is defined', () => {
    productListing.setAdditionalFields(['afield']);
    expectContainAction(setAdditionalFields);
  });
});
