import {ChildProduct} from '../../../api/commerce/common/product.js';
import {configuration} from '../../../app/common-reducers.js';
import {contextReducer} from '../../../features/commerce/context/context-slice.js';
import {
  pagePrincipalSelector,
  perPagePrincipalSelector,
  totalEntriesPrincipalSelector,
} from '../../../features/commerce/pagination/pagination-selectors.js';
import {parametersDefinition} from '../../../features/commerce/parameters/parameters-schema.js';
import {
  activeParametersSelector,
  enrichedParametersSelector,
} from '../../../features/commerce/parameters/parameters-selectors.js';
import {productListingSerializer} from '../../../features/commerce/parameters/parameters-serializer.js';
import {restoreProductListingParameters} from '../../../features/commerce/product-listing-parameters/product-listing-parameters-actions.js';
import * as ProductListingActions from '../../../features/commerce/product-listing/product-listing-actions.js';
import {
  errorSelector,
  isLoadingSelector,
  numberOfProductsSelector,
  requestIdSelector,
  responseIdSelector,
} from '../../../features/commerce/product-listing/product-listing-selectors.js';
import {productListingReducer} from '../../../features/commerce/product-listing/product-listing-slice.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import * as SubControllers from '../core/sub-controller/headless-sub-controller.js';
import {
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from './facets/headless-product-listing-facet-options.js';
import {
  buildProductListing,
  ProductListing,
} from './headless-product-listing.js';

describe('headless product-listing', () => {
  let productListing: ProductListing;
  let engine: MockedCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    productListing = buildProductListing(engine);
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
    const promoteChildToParent = vi.spyOn(
      ProductListingActions,
      'promoteChildToParent'
    );
    const child = {permanentid: 'childPermanentId'} as ChildProduct;

    productListing.promoteChildToParent(child);

    expect(promoteChildToParent).toHaveBeenCalledWith({
      child,
    });
  });

  it('#refresh dispatches #fetchProductListing', () => {
    const fetchProductListing = vi.spyOn(
      ProductListingActions,
      'fetchProductListing'
    );

    productListing.refresh();

    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('#executeFirstRequest dispatches #fetchProductListing', () => {
    const executeRequest = vi.spyOn(
      ProductListingActions,
      'fetchProductListing'
    );

    productListing.executeFirstRequest();

    expect(executeRequest).toHaveBeenCalled();
  });
});
