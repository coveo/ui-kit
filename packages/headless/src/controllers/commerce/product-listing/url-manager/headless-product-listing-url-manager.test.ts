import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {
  ProductListingParameters,
  restoreProductListingParameters,
} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildProductListingUrlManager} from './headless-product-listing-url-manager';

describe('product listing url manager', () => {
  let engine: MockCommerceEngine;

  function initUrlManager(fragment = '') {
    buildProductListingUrlManager(engine, {
      initialState: {
        fragment,
      },
    });
  }

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    initUrlManager();
  });

  function getLatestRestoreSearchParametersAction() {
    const restoreSearchParametersActions = engine.actions.filter(
      (action) => action.type === restoreProductListingParameters.type
    );
    return restoreSearchParametersActions[
      restoreSearchParametersActions.length - 1
    ];
  }

  function testLatestRestoreSearchParameters(params: ProductListingParameters) {
    const action = restoreProductListingParameters(params);
    expect(getLatestRestoreSearchParametersAction()).toEqual(action);
  }

  describe('initialization', () => {
    it('adds the correct reducers to the engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({productListing});
    });

    it('dispatches #restoreSearchParameters', () => {
      expect(getLatestRestoreSearchParametersAction()).toBeTruthy();
    });

    it('does not fetch a product listing', () => {
      expect(engine.findAsyncAction(fetchProductListing.pending)).toBeFalsy();
    });

    it('initial #restoreActionCreator should parse the "active" fragment', () => {
      initUrlManager('');
      testLatestRestoreSearchParameters({});
    });
  });
});
