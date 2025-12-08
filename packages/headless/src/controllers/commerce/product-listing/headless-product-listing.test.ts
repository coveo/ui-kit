import type {ChildProduct} from '../../../api/commerce/common/product.js';
import {configuration} from '../../../app/common-reducers.js';
import {contextReducer} from '../../../features/commerce/context/context-slice.js';
import {
  pagePrincipalSelector,
  perPagePrincipalSelector,
  totalEntriesPrincipalSelector,
} from '../../../features/commerce/pagination/pagination-selectors.js';
import {parametersDefinition} from '../../../features/commerce/parameters/parameters-schema.js';
import {activeParametersSelector} from '../../../features/commerce/parameters/parameters-selectors.js';
import {productListingSerializer} from '../../../features/commerce/parameters/parameters-serializer.js';
import * as ProductListingActions from '../../../features/commerce/product-listing/product-listing-actions.js';
import {
  errorSelector,
  isLoadingSelector,
  numberOfProductsSelector,
  requestIdSelector,
  responseIdSelector,
} from '../../../features/commerce/product-listing/product-listing-selectors.js';
import {productListingReducer} from '../../../features/commerce/product-listing/product-listing-slice.js';
import {restoreProductListingParameters} from '../../../features/commerce/product-listing-parameters/product-listing-parameters-actions.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import * as SubControllers from '../core/sub-controller/headless-sub-controller.js';
import {
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from './facets/headless-product-listing-facet-options.js';
import {buildProductListing} from './headless-product-listing.js';

describe('headless product-listing', () => {
  let engine: MockedCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses sub-controllers', () => {
    const buildProductListingSubControllers = vi.spyOn(
      SubControllers,
      'buildProductListingSubControllers'
    );

    buildProductListing(engine);

    expect(buildProductListingSubControllers).toHaveBeenCalledWith(engine, {
      responseIdSelector,
      fetchProductsActionCreator: expect.any(Function),
      fetchMoreProductsActionCreator: expect.any(Function),
      facetResponseSelector,
      isFacetLoadingResponseSelector,
      requestIdSelector,
      serializer: productListingSerializer,
      parametersDefinition,
      activeParametersSelector,
      restoreActionCreator: restoreProductListingParameters,
      isLoadingSelector,
      errorSelector,
      pageSelector: pagePrincipalSelector,
      perPageSelector: perPagePrincipalSelector,
      totalEntriesSelector: totalEntriesPrincipalSelector,
      numberOfProductsSelector,
    });
  });

  it('creates closures for fetching products that capture default enableResults=false', () => {
    const buildProductListingSubControllers = vi.spyOn(
      SubControllers,
      'buildProductListingSubControllers'
    );
    const fetchProductListingMock = vi.spyOn(
      ProductListingActions,
      'fetchProductListing'
    );
    const fetchMoreProductsMock = vi.spyOn(
      ProductListingActions,
      'fetchMoreProducts'
    );

    buildProductListing(engine);

    const callArgs = buildProductListingSubControllers.mock.calls[0][1];
    callArgs.fetchProductsActionCreator();
    expect(fetchProductListingMock).toHaveBeenCalledWith({
      enableResults: false,
    });

    callArgs.fetchMoreProductsActionCreator();
    expect(fetchMoreProductsMock).toHaveBeenCalledWith({enableResults: false});
  });

  it('creates closures for fetching products that capture enableResults=true', () => {
    const buildProductListingSubControllers = vi.spyOn(
      SubControllers,
      'buildProductListingSubControllers'
    );
    const fetchProductListingMock = vi.spyOn(
      ProductListingActions,
      'fetchProductListing'
    );
    const fetchMoreProductsMock = vi.spyOn(
      ProductListingActions,
      'fetchMoreProducts'
    );

    buildProductListing(engine, {enableResults: true});

    const callArgs = buildProductListingSubControllers.mock.calls[0][1];
    callArgs.fetchProductsActionCreator();
    expect(fetchProductListingMock).toHaveBeenCalledWith({enableResults: true});

    callArgs.fetchMoreProductsActionCreator();
    expect(fetchMoreProductsMock).toHaveBeenCalledWith({enableResults: true});
  });

  it('adds the correct reducers to engine', () => {
    buildProductListing(engine);
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing: productListingReducer,
      commerceContext: contextReducer,
      configuration,
    });
  });

  it('#promoteChildToParent dispatches #promoteChildToParent with the correct arguments', () => {
    const promoteChildToParent = vi.spyOn(
      ProductListingActions,
      'promoteChildToParent'
    );
    const child = {permanentid: 'childPermanentId'} as ChildProduct;

    const productListing = buildProductListing(engine);
    productListing.promoteChildToParent(child);

    expect(promoteChildToParent).toHaveBeenCalledWith({
      child,
    });
  });

  it('#refresh dispatches #fetchProductListing with enableResults=false by default', () => {
    const fetchProductListing = vi.spyOn(
      ProductListingActions,
      'fetchProductListing'
    );

    const productListing = buildProductListing(engine);
    productListing.refresh();

    expect(fetchProductListing).toHaveBeenCalledWith({enableResults: false});
  });

  it('#refresh dispatches #fetchProductListing with enableResults=true when specified', () => {
    const fetchProductListing = vi.spyOn(
      ProductListingActions,
      'fetchProductListing'
    );
    const productListingWithResults = buildProductListing(engine, {
      enableResults: true,
    });

    productListingWithResults.refresh();

    expect(fetchProductListing).toHaveBeenCalledWith({enableResults: true});
  });

  it('#executeFirstRequest dispatches #fetchProductListing with enableResults=false by default', () => {
    const executeRequest = vi.spyOn(
      ProductListingActions,
      'fetchProductListing'
    );
    const productListing = buildProductListing(engine);
    productListing.executeFirstRequest();

    expect(executeRequest).toHaveBeenCalledWith({enableResults: false});
  });

  it('#executeFirstRequest dispatches #fetchProductListing with enableResults=true when specified', () => {
    const executeRequest = vi.spyOn(
      ProductListingActions,
      'fetchProductListing'
    );
    const productListingWithResults = buildProductListing(engine, {
      enableResults: true,
    });

    productListingWithResults.executeFirstRequest();

    expect(executeRequest).toHaveBeenCalledWith({enableResults: true});
  });
});
