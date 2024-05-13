import {configuration} from '../../../app/common-reducers';
import {contextReducer} from '../../../features/commerce/context/context-slice';
import * as ProductListingActions from '../../../features/commerce/product-listing/product-listing-actions';
import {responseIdSelector} from '../../../features/commerce/product-listing/product-listing-selectors';
import {productListingV2Reducer} from '../../../features/commerce/product-listing/product-listing-slice';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2';
import * as SubControllers from '../core/sub-controller/headless-sub-controller';
import {
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from './facets/headless-product-listing-facet-options';
import {buildProductListing, ProductListing} from './headless-product-listing';

describe('headless product-listing', () => {
  let productListing: ProductListing;
  let engine: MockedCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    productListing = buildProductListing(engine);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses sub-controllers', () => {
    const buildSearchAndListingsSubControllers = jest.spyOn(
      SubControllers,
      'buildSearchAndListingsSubControllers'
    );

    buildProductListing(engine);

    expect(buildSearchAndListingsSubControllers).toHaveBeenCalledWith(engine, {
      responseIdSelector,
      fetchProductsActionCreator: ProductListingActions.fetchProductListing,
      fetchMoreProductsActionCreator: ProductListingActions.fetchMoreProducts,
      facetResponseSelector,
      isFacetLoadingResponseSelector,
    });
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing: productListingV2Reducer,
      commerceContext: contextReducer,
      configuration,
    });
  });

  it('refresh dispatches #fetchProductListing', () => {
    const fetchProductListing = jest.spyOn(
      ProductListingActions,
      'fetchProductListing'
    );

    productListing.refresh();

    expect(fetchProductListing).toHaveBeenCalled();
  });
});
