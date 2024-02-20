import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {restoreProductListingParameters} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {UrlManager} from '../../../url-manager/headless-url-manager';
import {buildProductListingUrlManager} from './headless-product-listing-url-manager';

jest.mock(
  '../../../../features/commerce/search-parameters/search-parameter-actions'
);
jest.mock(
  '../../../../features/commerce/product-listing/product-listing-actions'
);

describe('product listing url manager', () => {
  let engine: MockedCommerceEngine;
  let manager: UrlManager;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initUrlManager(fragment = '') {
    manager = buildProductListingUrlManager(engine, {
      initialState: {
        fragment,
      },
    });
  }

  beforeEach(() => {
    jest.resetAllMocks();
    initEngine();
    initUrlManager();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(manager).toBeTruthy();
    });

    it('adds the correct reducers to the engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({productListing});
    });

    it('dispatches #restoreProductListingParameters', () => {
      const mockedRestoreProductListingParametersAction = jest.mocked(
        restoreProductListingParameters
      );
      expect(mockedRestoreProductListingParametersAction).toHaveBeenCalled();
    });

    it('does not fetch a product listing', () => {
      const mockedFetchProductListingAction = jest.mocked(fetchProductListing);
      expect(mockedFetchProductListingAction).not.toHaveBeenCalled();
    });

    it('initial #restoreActionCreator should parse the "active" fragment', () => {
      initUrlManager('');
      const mockedRestoreProductListingParametersAction = jest.mocked(
        restoreProductListingParameters
      );
      expect(
        mockedRestoreProductListingParametersAction
      ).toHaveBeenLastCalledWith({});
    });
  });
});
