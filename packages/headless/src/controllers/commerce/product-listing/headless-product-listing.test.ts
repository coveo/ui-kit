import {configuration} from '../../../app/common-reducers';
import {contextReducer} from '../../../features/commerce/context/context-slice';
import {fetchProductListing} from '../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer} from '../../../features/commerce/product-listing/product-listing-slice';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildProductListing, ProductListing} from './headless-product-listing';

jest.mock('../../../features/commerce/product-listing/product-listing-actions');

describe('headless product-listing', () => {
  let productListing: ProductListing;
  let engine: MockedCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    productListing = buildProductListing(engine);
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing: productListingV2Reducer,
      commerceContext: contextReducer,
      configuration,
    });
  });

  it('refresh dispatches #fetchProductListing', () => {
    productListing.refresh();
    expect(fetchProductListing).toHaveBeenCalled();
  });
});
