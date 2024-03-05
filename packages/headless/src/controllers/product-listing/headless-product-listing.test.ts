import {configuration} from '../../app/common-reducers';
import {
  fetchProductListing,
  setAdditionalFields,
  setProductListingUrl,
} from '../../features/product-listing/product-listing-actions';
import {productListingReducer} from '../../features/product-listing/product-listing-slice';
import {
  buildMockProductListingEngine,
  MockedProductListingEngine,
} from '../../test/mock-engine-v2';
import {buildMockProductListingState} from '../../test/mock-product-listing-state';
import {
  buildProductListing,
  ProductListing,
  ProductListingOptions,
} from './headless-product-listing';

jest.mock('../../features/product-listing/product-listing-actions');

describe('headless product-listing', () => {
  let productListing: ProductListing;
  let engine: MockedProductListingEngine;

  const baseOptions: ProductListingOptions = {
    url: 'https://someurl.com',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    engine = buildMockProductListingEngine(buildMockProductListingState());
    productListing = buildProductListing(engine, {
      options: baseOptions,
    });
  });

  it('adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing: productListingReducer,
      configuration,
    });
  });

  it('dispatches #setProductListingUrl on load', () => {
    expect(setProductListingUrl).toHaveBeenCalledWith({
      url: 'https://someurl.com',
    });
  });

  it('dispatches #setAdditionalFields on load if additionalFields is defined', () => {
    productListing = buildProductListing(engine, {
      options: {
        ...baseOptions,
        additionalFields: ['afield'],
      },
    });
    expect(setAdditionalFields).toHaveBeenCalledWith({
      additionalFields: ['afield'],
    });
  });

  it('setUrl dispatches #setProductListingUrl', () => {
    productListing.setUrl('http://bloup.🐟️');
    expect(setProductListingUrl).toHaveBeenCalledWith({
      url: 'http://bloup.🐟️',
    });
  });

  it('refresh dispatches #fetchProductListing', () => {
    productListing.refresh();
    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('dispatches #setAdditionalFields on load if additionalFields is defined', () => {
    productListing.setAdditionalFields(['afield']);
    expect(setAdditionalFields).toHaveBeenCalledWith({
      additionalFields: ['afield'],
    });
  });
});
