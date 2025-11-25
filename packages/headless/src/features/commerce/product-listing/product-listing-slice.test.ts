import type {
  BaseProduct,
  ChildProduct,
  Product,
} from '../../../api/commerce/common/product.js';
import {
  type BaseResult,
  type Result,
  ResultType,
} from '../../../api/commerce/common/result.js';
import {buildMockCommerceRegularFacetResponse} from '../../../test/mock-commerce-facet-response.js';
import {
  buildMockBaseProduct,
  buildMockChildProduct,
  buildMockProduct,
} from '../../../test/mock-product.js';
import {buildFetchProductListingResponse} from '../../../test/mock-product-listing.js';
import {setError} from '../../error/error-actions.js';
import {setContext, setView} from '../context/context-actions.js';
import {
  fetchMoreProducts,
  fetchProductListing,
  promoteChildToParent,
} from './product-listing-actions.js';
import {productListingReducer} from './product-listing-slice.js';
import {
  getProductListingInitialState,
  type ProductListingState,
} from './product-listing-state.js';

describe('product-listing-slice', () => {
  let state: ProductListingState;
  beforeEach(() => {
    state = getProductListingInitialState();
  });
  it('should have an initial state', () => {
    expect(productListingReducer(undefined, {type: 'foo'})).toEqual(
      getProductListingInitialState()
    );
  });

  describe('on #fetchProductListing.fulfilled', () => {
    it('updates the product listing state with the received payload', () => {
      const result = buildMockBaseProduct({ec_name: 'product1'});
      const facet = buildMockCommerceRegularFacetResponse();
      const responseId = 'some-response-id';
      const response = buildFetchProductListingResponse({
        results: [result],
        facets: [facet],
        responseId,
      });

      const action = fetchProductListing.fulfilled(response, '');
      const finalState = productListingReducer(state, action);
      const finalStateProducts = getProductsFromResults(finalState.results);
      const responseProducts = getBaseProductsFromBaseResults(
        response.response.results
      );

      expect(finalStateProducts).toEqual(
        responseProducts.map((p) =>
          buildMockProduct({ec_name: p?.ec_name, responseId})
        )
      );
      expect(finalState.facets[0]).toEqual(facet);
      expect(finalState.responseId).toEqual(responseId);
      expect(finalState.isLoading).toBe(false);
    });

    it('sets the #position of each product to its 1-based position in the unpaginated list', () => {
      const response = buildFetchProductListingResponse({
        results: [
          buildMockBaseProduct({ec_name: 'product1'}),
          buildMockBaseProduct({ec_name: 'product2'}),
        ],
        pagination: {
          page: 2,
          perPage: 10,
          totalEntries: 22,
          totalPages: 3,
        },
      });

      const action = fetchProductListing.fulfilled(response, '');
      const finalState = productListingReducer(state, action);
      const products = getProductsFromResults(finalState.results);

      expect(products[0]?.position).toBe(21);
      expect(products[1]?.position).toBe(22);
    });

    it('sets the responseId on each product', () => {
      const results = [
        buildMockBaseProduct({ec_name: 'product1'}),
        buildMockBaseProduct({ec_name: 'product2'}),
      ];
      const responseId = 'some-response-id';
      const response = buildFetchProductListingResponse({
        results,
        responseId,
      });

      const action = fetchProductListing.fulfilled(response, '');
      const finalState = productListingReducer(state, action);

      const products = getProductsFromResults(finalState.results);
      expect(products[0]?.responseId).toBe(responseId);
      expect(products[1]?.responseId).toBe(responseId);
    });

    it('set #error to null ', () => {
      const err = {message: 'message', statusCode: 500, type: 'type'};
      state.error = err;

      const response = buildFetchProductListingResponse();

      const action = fetchProductListing.fulfilled(response, '');
      const finalState = productListingReducer(state, action);
      expect(finalState.error).toBeNull();
    });
  });

  describe('on #fetchMoreProducts.fulfilled', () => {
    it('appends the received products to the product listing state', () => {
      state.results = [
        buildMockProduct({ec_name: 'product1', responseId: 'old-response-id'}),
        buildMockProduct({ec_name: 'product2', responseId: 'old-response-id'}),
      ];
      const result = buildMockBaseProduct({ec_name: 'product3'});
      const facet = buildMockCommerceRegularFacetResponse();
      const responseId = 'some-response-id';
      const response = buildFetchProductListingResponse({
        results: [result],
        facets: [facet],
        responseId,
      });

      const action = fetchMoreProducts.fulfilled(response, '');
      const finalState = productListingReducer(state, action);
      const products = getProductsFromResults(finalState.results);

      expect(products.map((p) => p?.ec_name)).toEqual([
        'product1',
        'product2',
        'product3',
      ]);
      expect(finalState.facets).toEqual([facet]);
      expect(finalState.responseId).toEqual(responseId);
      expect(finalState.isLoading).toBe(false);
    });

    it('sets the #position of each product to its 1-based position in the unpaginated list', () => {
      state.results = [
        buildMockProduct({
          ec_name: 'product1',
          position: 1,
        }),
        buildMockProduct({
          ec_name: 'product2',
          position: 2,
        }),
      ];
      const response = buildFetchProductListingResponse({
        results: [buildMockBaseProduct({ec_name: 'product3'})],
        pagination: {
          page: 1,
          perPage: 2,
          totalEntries: 22,
          totalPages: 3,
        },
      });

      const action = fetchMoreProducts.fulfilled(response, '');
      const finalState = productListingReducer(state, action);
      const products = getProductsFromResults(finalState.results);

      expect(products[0]?.position).toBe(1);
      expect(products[1]?.position).toBe(2);
      expect(products[2]?.position).toBe(3);
    });

    it('sets the responseId on new products while preserving existing products responseId', () => {
      state.results = [
        buildMockProduct({
          ec_name: 'product1',
          position: 1,
          responseId: 'old-response-id',
        }),
        buildMockProduct({
          ec_name: 'product2',
          position: 2,
          responseId: 'old-response-id',
        }),
      ];
      const newProduct = buildMockBaseProduct({ec_name: 'product3'});
      const responseId = 'new-response-id';
      const response = buildFetchProductListingResponse({
        results: [newProduct],
        responseId,
        pagination: {
          page: 1,
          perPage: 2,
          totalEntries: 22,
          totalPages: 3,
        },
      });

      const action = fetchMoreProducts.fulfilled(response, '');
      const finalState = productListingReducer(state, action);
      const products = getProductsFromResults(finalState.results);

      // Original products keep their responseId
      expect(products[0]?.responseId).toBe('old-response-id');
      expect(products[1]?.responseId).toBe('old-response-id');
      // New products get the new responseId
      expect(products[2]?.responseId).toBe(responseId);
    });

    it('set #error to null', () => {
      const err = {message: 'message', statusCode: 500, type: 'type'};
      state.error = err;

      const response = buildFetchProductListingResponse();
      const action = fetchMoreProducts.fulfilled(response, '');
      const finalState = productListingReducer(state, action);
      expect(finalState.error).toBeNull();
    });
  });

  describe('on #fetchProductListing.rejected', () => {
    it('sets #error', () => {
      const err = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };
      const action = {
        type: 'commerce/productListing/fetch/rejected',
        payload: err,
      };
      const finalState = productListingReducer(state, action);
      expect(finalState.error).toEqual(err);
      expect(finalState.isLoading).toBe(false);
    });

    it('sets #isLoading to false', () => {
      const err = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };
      state.isLoading = true;
      const action = {
        type: 'commerce/productListing/fetch/rejected',
        payload: err,
      };
      const finalState = productListingReducer(state, action);
      expect(finalState.isLoading).toBe(false);
    });
  });

  describe('on #fetchMoreProducts.rejected', () => {
    it('sets #error', () => {
      const err = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };
      const action = {
        type: 'commerce/productListing/fetchMoreProducts/rejected',
        payload: err,
      };
      const finalState = productListingReducer(state, action);
      expect(finalState.error).toEqual(err);
      expect(finalState.isLoading).toBe(false);
    });

    it('sets #isLoading to false', () => {
      const err = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };
      state.isLoading = true;
      const action = {
        type: 'commerce/productListing/fetchMoreProducts/rejected',
        payload: err,
      };
      const finalState = productListingReducer(state, action);
      expect(finalState.isLoading).toBe(false);
    });
  });

  describe('on #fetchProductListing.pending', () => {
    it('sets #isLoading to true', () => {
      const pendingAction = fetchProductListing.pending('');
      const finalState = productListingReducer(state, pendingAction);
      expect(finalState.isLoading).toBe(true);
    });

    it('sets #requestId', () => {
      const pendingAction = fetchProductListing.pending('request-id');
      const finalState = productListingReducer(state, pendingAction);
      expect(finalState.requestId).toBe('request-id');
    });
  });

  describe('on #fetchMoreProducts.pending', () => {
    it('sets #isLoading to true', () => {
      const pendingAction = fetchMoreProducts.pending('');
      const finalState = productListingReducer(state, pendingAction);
      expect(finalState.isLoading).toBe(true);
    });

    it('sets #requestId', () => {
      const pendingAction = fetchMoreProducts.pending('request-id');
      const finalState = productListingReducer(state, pendingAction);
      expect(finalState.requestId).toBe('request-id');
    });
  });

  describe('on #promoteChildToParent', () => {
    const permanentid = 'child-id';
    const parentPermanentId = 'parent-id';
    let action: ReturnType<typeof promoteChildToParent>;

    beforeEach(() => {
      action = promoteChildToParent({
        child: {permanentid} as ChildProduct,
      });
    });

    it('when parent does not exist, it does not change the state', () => {
      const finalState = productListingReducer(state, action);

      expect(finalState).toEqual(state);
    });

    it('when child does not exist, it does not change the state', () => {
      state.results = [
        buildMockProduct({permanentid: parentPermanentId, children: []}),
      ];

      const finalState = productListingReducer(state, action);

      expect(finalState).toEqual(state);
    });

    it('when both parent and child exist, promotes the child to parent', () => {
      const childProduct = buildMockChildProduct({
        permanentid,
        additionalFields: {test: 'test'},
        clickUri: 'child-uri',
        ec_brand: 'child brand',
        ec_category: ['child category'],
        ec_description: 'child description',
        ec_gender: 'child gender',
        ec_images: ['child image'],
        ec_in_stock: false,
        ec_item_group_id: 'child item group id',
        ec_name: 'child name',
        ec_product_id: 'child product id',
        ec_promo_price: 1,
        ec_rating: 1,
        ec_shortdesc: 'child short description',
        ec_thumbnails: ['child thumbnail'],
        ec_price: 2,
      });

      const parentProduct = buildMockProduct({
        permanentid: parentPermanentId,
        children: [childProduct],
        totalNumberOfChildren: 1,
        position: 5,
        responseId: 'test-response-id',
      });

      state.results = [parentProduct];

      const finalState = productListingReducer(state, action);

      expect(finalState.results).toEqual([
        buildMockProduct({
          ...childProduct,
          children: parentProduct.children,
          totalNumberOfChildren: parentProduct.totalNumberOfChildren,
          position: parentProduct.position,
          responseId: parentProduct.responseId,
        }),
      ]);
    });
  });
  it('on #setView, restores the initial state', () => {
    state = {
      error: {message: 'error', statusCode: 500, type: 'type'},
      isLoading: true,
      results: [buildMockProduct({ec_name: 'product1'})],
      facets: [buildMockCommerceRegularFacetResponse()],
      responseId: 'response-id',
      requestId: 'request-id',
    };

    const finalState = productListingReducer(state, setView({url: '/'}));

    expect(finalState).toEqual(getProductListingInitialState());
  });

  it('on #setContext, restores the initial state', () => {
    state = {
      error: {message: 'error', statusCode: 500, type: 'type'},
      isLoading: true,
      results: [buildMockProduct({ec_name: 'product1'})],
      facets: [buildMockCommerceRegularFacetResponse()],
      responseId: 'response-id',
      requestId: 'request-id',
    };

    const finalState = productListingReducer(
      state,
      setContext({
        country: 'CA',
        currency: 'CAD',
        language: 'fr',
        view: {url: '/'},
      })
    );

    expect(finalState).toEqual(getProductListingInitialState());
  });

  describe('on #setError', () => {
    it('should set the error state and set isLoading to false', () => {
      const error = {
        message: 'Something went wrong',
        statusCode: 401,
        status: 401,
        type: 'BadRequest',
      };
      state.isLoading = true;

      const finalState = productListingReducer(state, setError(error));

      expect(finalState.error).toEqual(error);
      expect(finalState.isLoading).toBe(false);
    });
  });
});

const getProductsFromResults = (results: Result[]) => {
  const products: Array<Product | null> = [];
  for (const result of results) {
    products.push(result.resultType !== ResultType.SPOTLIGHT ? result : null);
  }
  return products;
};

const getBaseProductsFromBaseResults = (results: BaseResult[]) => {
  const products: Array<BaseProduct | null> = [];
  for (const result of results) {
    products.push(result.resultType !== ResultType.SPOTLIGHT ? result : null);
  }
  return products;
};
