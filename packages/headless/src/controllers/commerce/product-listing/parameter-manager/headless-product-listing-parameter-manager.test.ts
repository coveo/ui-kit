import {Action} from '@reduxjs/toolkit';
import {
  ProductListingParameters,
  restoreProductListingParameters,
} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {ParameterManager} from '../../core/parameter-manager/headless-core-parameter-manager';
import {buildProductListingParameterManager} from './headless-product-listing-parameter-manager';

describe('product listing parameter manager', () => {
  let engine: MockCommerceEngine;
  let productListingParameterManager: ParameterManager<ProductListingParameters>;

  function initProductListingParameterManager() {
    engine = buildMockCommerceEngine();

    productListingParameterManager = buildProductListingParameterManager(
      engine,
      {
        initialState: {parameters: {}},
      }
    );
  }

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  beforeEach(() => {
    initProductListingParameterManager();
  });

  it('exposes #subscribe method', () => {
    expect(productListingParameterManager.subscribe).toBeTruthy();
  });

  it('dispatches #restoreProductListingParameters on init', () => {
    expectContainAction(restoreProductListingParameters({}));
  });

  it('#state contains #parameters', () => {
    expect(productListingParameterManager.state.parameters).toEqual({});
  });
});
