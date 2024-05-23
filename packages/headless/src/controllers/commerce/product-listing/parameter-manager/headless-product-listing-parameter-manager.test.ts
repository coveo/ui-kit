import {
  ProductListingParameters,
  restoreProductListingParameters,
} from '../../../../features/commerce/product-listing-parameters/product-listing-parameter-actions';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {ParameterManager} from '../../core/parameter-manager/headless-core-parameter-manager';
import {buildProductListingParameterManager} from './headless-product-listing-parameter-manager';

jest.mock(
  '../../../../features/commerce/product-listing-parameters/product-listing-parameter-actions'
);

describe('product listing parameter manager', () => {
  let engine: MockedCommerceEngine;
  let productListingParameterManager: ParameterManager<ProductListingParameters>;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initProductListingParameterManager() {
    productListingParameterManager = buildProductListingParameterManager(
      engine,
      {
        initialState: {parameters: {}},
      }
    );
  }

  beforeEach(() => {
    initEngine();
    initProductListingParameterManager();
  });

  it('exposes #subscribe method', () => {
    expect(productListingParameterManager.subscribe).toBeTruthy();
  });

  it('dispatches #restoreProductListingParameters on init', () => {
    const mockedRestoreProductListingParametersAction = jest.mocked(
      restoreProductListingParameters
    );
    expect(mockedRestoreProductListingParametersAction).toHaveBeenCalledWith(
      {}
    );
  });

  it('#state contains #parameters', () => {
    expect(productListingParameterManager.state.parameters).toEqual({});
  });
});
