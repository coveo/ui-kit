import {configuration} from '../../../app/common-reducers';
import {contextReducer} from '../../../features/commerce/context/context-slice';
import {
  pagePrincipalSelector,
  perPagePrincipalSelector,
  totalEntriesPrincipalSelector,
} from '../../../features/commerce/pagination/pagination-selectors';
import {parametersDefinition} from '../../../features/commerce/parameters/parameters-schema';
import {
  activeParametersSelector,
  enrichedParametersSelector,
} from '../../../features/commerce/parameters/parameters-selectors';
import {productListingSerializer} from '../../../features/commerce/parameters/parameters-serializer';
import {restoreProductListingParameters} from '../../../features/commerce/product-listing-parameters/product-listing-parameters-actions';
import * as ProductListingActions from '../../../features/commerce/product-listing/product-listing-actions';
import {
  errorSelector,
  isLoadingSelector,
  numberOfProductsSelector,
  requestIdSelector,
  responseIdSelector,
} from '../../../features/commerce/product-listing/product-listing-selectors';
import {productListingReducer} from '../../../features/commerce/product-listing/product-listing-slice';
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
      isLoadingSelector,
      errorSelector,
      pageSelector: pagePrincipalSelector,
      perPageSelector: perPagePrincipalSelector,
      totalEntriesSelector: totalEntriesPrincipalSelector,
      numberOfProductsSelector,
    });
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing: productListingReducer,
      commerceContext: contextReducer,
      configuration,
    });
  });

  it('#promoteChildToParent dispatches #promoteChildToParent with the correct arguments', () => {
    const promoteChildToParent = jest.spyOn(
      ProductListingActions,
      'promoteChildToParent'
    );
    const childPermanentId = 'childPermanentId';
    const parentPermanentId = 'parentPermanentId';

    productListing.promoteChildToParent(childPermanentId, parentPermanentId);

    expect(promoteChildToParent).toHaveBeenCalledWith({
      childPermanentId,
      parentPermanentId,
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
