import {ChildProduct} from '../../../api/commerce/common/product.js';
import {buildMockCommerceRegularFacetResponse} from '../../../test/mock-commerce-facet-response.js';
import {buildFetchProductListingResponse} from '../../../test/mock-product-listing.js';
import {
  buildMockChildProduct,
  buildMockProduct,
  buildMockBaseProduct,
} from '../../../test/mock-product.js';
import {setContext, setView} from '../context/context-actions.js';
import {
  fetchMoreProducts,
  fetchProductListing,
  promoteChildToParent,
} from './product-listing-actions.js';
import {productListingReducer} from './product-listing-slice.js';
import {
  getProductListingInitialState,
  ProductListingState,
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
        products: [result],
        facets: [facet],
        responseId,
      });

      const action = fetchProductListing.fulfilled(response, '');
      const finalState = productListingReducer(state, action);

      expect(finalState.products).toEqual(
        response.response.products.map((p) =>
          buildMockProduct({ec_name: p.ec_name})
        )
      );
      expect(finalState.facets[0]).toEqual(facet);
      expect(finalState.responseId).toEqual(responseId);
      expect(finalState.isLoading).toBe(false);
    });

    it('sets the #position of each product to its 1-based position in the unpaginated list', () => {
      const response = buildFetchProductListingResponse({
        products: [
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

      expect(finalState.products[0].position).toBe(21);
      expect(finalState.products[1].position).toBe(22);
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
      state.products = [
        buildMockProduct({ec_name: 'product1'}),
        buildMockProduct({ec_name: 'product2'}),
      ];
      const result = buildMockBaseProduct({ec_name: 'product3'});
      const facet = buildMockCommerceRegularFacetResponse();
      const responseId = 'some-response-id';
      const response = buildFetchProductListingResponse({
        products: [result],
        facets: [facet],
        responseId,
      });

      const action = fetchMoreProducts.fulfilled(response, '');
      const finalState = productListingReducer(state, action);

      expect(finalState.products.map((p) => p.ec_name)).toEqual([
        'product1',
        'product2',
        'product3',
      ]);
      expect(finalState.facets).toEqual([facet]);
      expect(finalState.responseId).toEqual(responseId);
      expect(finalState.isLoading).toBe(false);
    });

    it('sets the #position of each product to its 1-based position in the unpaginated list', () => {
      state.products = [
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
        products: [buildMockBaseProduct({ec_name: 'product3'})],
        pagination: {
          page: 1,
          perPage: 2,
          totalEntries: 22,
          totalPages: 3,
        },
      });

      const action = fetchMoreProducts.fulfilled(response, '');
      const finalState = productListingReducer(state, action);

      expect(finalState.products[0].position).toBe(1);
      expect(finalState.products[1].position).toBe(2);
      expect(finalState.products[2].position).toBe(3);
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
      state.products = [
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
      });

      state.products = [parentProduct];

      const finalState = productListingReducer(state, action);

      expect(finalState.products).toEqual([
        buildMockProduct({
          ...childProduct,
          children: parentProduct.children,
          totalNumberOfChildren: parentProduct.totalNumberOfChildren,
          position: parentProduct.position,
        }),
      ]);
    });
  });
  it('on #setView, restores the initial state', () => {
    state = {
      error: {message: 'error', statusCode: 500, type: 'type'},
      isLoading: true,
      products: [buildMockProduct({ec_name: 'product1'})],
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
      products: [buildMockProduct({ec_name: 'product1'})],
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
});
