import {configuration} from '../../../app/common-reducers';
import {contextReducer} from '../../../features/commerce/context/context-slice';
import {parametersDefinition} from '../../../features/commerce/parameters/parameters-schema';
import {
  activeParametersSelector,
  enrichedParametersSelector,
} from '../../../features/commerce/parameters/parameters-selectors';
import {productListingSerializer} from '../../../features/commerce/parameters/parameters-serializer';
import {restoreProductListingParameters} from '../../../features/commerce/product-listing-parameters/product-listing-parameter-actions';
import * as ProductListingActions from '../../../features/commerce/product-listing/product-listing-actions';
import {
  requestIdSelector,
  responseIdSelector,
} from '../../../features/commerce/product-listing/product-listing-selectors';
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
    const buildProductListingSubControllers = jest.spyOn(
      SubControllers,
      'buildProductListingSubControllers'
    );

    buildProductListing(engine);

    expect(buildProductListingSubControllers).toHaveBeenCalledWith(engine, {
      responseIdSelector,
      fetchProductsActionCreator: ProductListingActions.fetchProductListing,
      fetchMoreProductsActionCreator: ProductListingActions.fetchMoreProducts,
      facetResponseSelector,
      isFacetLoadingResponseSelector,
      requestIdSelector,
      serializer: productListingSerializer,
      parametersDefinition,
      activeParametersSelector,
      restoreActionCreator: restoreProductListingParameters,
      enrichParameters: enrichedParametersSelector,
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
