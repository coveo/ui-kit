import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../test/mock-engine';
import {
  buildProductListing,
  ProductListingController,
  ProductListingOptions,
} from './headless-product-listing';
import {Action} from 'redux';
import {configuration} from '../../app/reducers';
import {productListingReducer} from '../../features/product-listing/product-listing-slice';
import {
  fetchProductListing,
  setProductListingUrl,
} from '../../features/product-listing/product-listing-actions';

describe('headless product-listing', () => {
  let productRecommendations: ProductListingController;
  let engine: MockProductListingEngine;

  const baseOptions: Partial<ProductListingOptions> = {
    url: 'https://someurl.com',
  };

  beforeEach(() => {
    engine = buildMockProductListingEngine();
    productRecommendations = buildProductListing(engine, {
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

  it('refresh dispatches #fetchProductListing', () => {
    productRecommendations.refresh();
    expectContainAction(fetchProductListing.pending);
  });
});
