import type {ChildProduct} from '../../../api/commerce/common/product.js';
import {buildMockCommerceRegularFacetResponse} from '../../../test/mock-commerce-facet-response.js';
import {buildSearchResponse} from '../../../test/mock-commerce-search.js';
import {
  buildMockBaseProduct,
  buildMockChildProduct,
  buildMockProduct,
} from '../../../test/mock-product.js';
import {setError} from '../../error/error-actions.js';
import {setContext, setView} from '../context/context-actions.js';
import {
  executeSearch,
  fetchMoreProducts,
  promoteChildToParent,
} from './search-actions.js';
import {commerceSearchReducer} from './search-slice.js';
import {
  type CommerceSearchState,
  getCommerceSearchInitialState,
} from './search-state.js';

describe('search-slice', () => {
  let state: CommerceSearchState;

  beforeEach(() => {
    state = getCommerceSearchInitialState();
  });

  it('should have an initial state', () => {
    expect(commerceSearchReducer(undefined, {type: ''})).toEqual(
      getCommerceSearchInitialState()
    );
  });

  describe('on #executeSearch.fulfilled', () => {
    it('updates the state with the received payload', () => {
      const products = [buildMockBaseProduct({ec_name: 'product1'})];
      const facets = [buildMockCommerceRegularFacetResponse()];
      const responseId = 'some-response-id';
      const response = buildSearchResponse({
        products,
        facets,
        responseId,
      });

      const action = executeSearch.fulfilled(response, '');
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.products).toEqual(
        products.map((p) => buildMockProduct({ec_name: p.ec_name, responseId}))
      );
      expect(finalState.facets).toEqual(facets);
      expect(finalState.responseId).toEqual(responseId);
      expect(finalState.isLoading).toBe(false);
    });

    it('sets the #position of each product to its 1-based position in the unpaginated list', () => {
      const response = buildSearchResponse({
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

      const action = executeSearch.fulfilled(response, '');
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.products[0].position).toBe(21);
      expect(finalState.products[1].position).toBe(22);
    });

    it('sets the responseId on each product', () => {
      const products = [
        buildMockBaseProduct({ec_name: 'product1'}),
        buildMockBaseProduct({ec_name: 'product2'}),
      ];
      const responseId = 'some-response-id';
      const response = buildSearchResponse({
        products,
        responseId,
      });

      const action = executeSearch.fulfilled(response, '');
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.products[0].responseId).toBe(responseId);
      expect(finalState.products[1].responseId).toBe(responseId);
    });

    it('sets #error to null', () => {
      state.error = {message: 'message', statusCode: 500, type: 'type'};

      const response = buildSearchResponse();

      const action = executeSearch.fulfilled(response, '');
      const finalState = commerceSearchReducer(state, action);
      expect(finalState.error).toBeNull();
    });
  });

  describe('on #fetchMoreProducts.fulfilled', () => {
    it('updates the state with the received payload', () => {
      state.products = [
        buildMockProduct({ec_name: 'product1', responseId: 'old-response-id'}),
        buildMockProduct({ec_name: 'product2', responseId: 'old-response-id'}),
      ];
      const newProducts = [
        buildMockBaseProduct({ec_name: 'product3'}),
        buildMockBaseProduct({ec_name: 'product4'}),
      ];
      const facets = [buildMockCommerceRegularFacetResponse()];
      const responseId = 'some-response-id';
      const response = buildSearchResponse({
        products: newProducts,
        facets,
        responseId,
      });

      const action = fetchMoreProducts.fulfilled(response, '');
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.products.length).toEqual(4);
      expect(finalState.products.map((p) => p.ec_name)).toEqual([
        'product1',
        'product2',
        'product3',
        'product4',
      ]);
      expect(finalState.facets).toEqual(facets);
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
      const response = buildSearchResponse({
        products: [buildMockBaseProduct({ec_name: 'product3'})],
        pagination: {
          page: 1,
          perPage: 2,
          totalEntries: 22,
          totalPages: 3,
        },
      });

      const action = fetchMoreProducts.fulfilled(response, '');
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.products[0].position).toBe(1);
      expect(finalState.products[1].position).toBe(2);
      expect(finalState.products[2].position).toBe(3);
    });

    it('sets the responseId on new products while preserving existing products responseId', () => {
      state.products = [
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
      const newProducts = [buildMockBaseProduct({ec_name: 'product3'})];
      const responseId = 'new-response-id';
      const response = buildSearchResponse({
        products: newProducts,
        responseId,
        pagination: {
          page: 1,
          perPage: 2,
          totalEntries: 22,
          totalPages: 3,
        },
      });

      const action = fetchMoreProducts.fulfilled(response, '');
      const finalState = commerceSearchReducer(state, action);

      // Original products keep their responseId
      expect(finalState.products[0].responseId).toBe('old-response-id');
      expect(finalState.products[1].responseId).toBe('old-response-id');
      // New products get the new responseId
      expect(finalState.products[2].responseId).toBe(responseId);
    });

    it('sets #error to null', () => {
      state.error = {message: 'message', statusCode: 500, type: 'type'};

      const response = buildSearchResponse();

      const action = fetchMoreProducts.fulfilled(response, '');
      const finalState = commerceSearchReducer(state, action);
      expect(finalState.error).toBeNull();
    });
  });

  describe('on #executeSearch.rejected', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };

    it('sets #error', () => {
      const action = {type: executeSearch.rejected.type, payload: err};
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.error).toEqual(err);
      expect(finalState.isLoading).toBe(false);
    });

    it('sets #isLoading to false', () => {
      state.isLoading = true;

      const action = {type: executeSearch.rejected.type, payload: err};
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.error).toEqual(err);
      expect(finalState.isLoading).toBe(false);
    });
  });

  describe('on #fetchMoreProducts.rejected', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };

    it('sets #error', () => {
      const action = {type: fetchMoreProducts.rejected.type, payload: err};
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.error).toEqual(err);
      expect(finalState.isLoading).toBe(false);
    });

    it('sets #isLoading to false', () => {
      state.isLoading = true;

      const action = {type: fetchMoreProducts.rejected.type, payload: err};
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.error).toEqual(err);
      expect(finalState.isLoading).toBe(false);
    });
  });

  describe('on #executeSearch.pending', () => {
    it('sets #isLoading to true', () => {
      state.isLoading = false;

      const pendingAction = executeSearch.pending('');
      const finalState = commerceSearchReducer(state, pendingAction);

      expect(finalState.isLoading).toBe(true);
    });

    it('sets #requestId', () => {
      const requestId = 'request-id';

      const pendingAction = executeSearch.pending(requestId);
      const finalState = commerceSearchReducer(state, pendingAction);

      expect(finalState.requestId).toBe(requestId);
    });
  });

  describe('on #fetchMoreProducts.pending', () => {
    it('sets #isLoading to true', () => {
      state.isLoading = false;

      const pendingAction = fetchMoreProducts.pending('');
      const finalState = commerceSearchReducer(state, pendingAction);

      expect(finalState.isLoading).toBe(true);
    });

    it('sets #requestId', () => {
      const requestId = 'request-id';

      const pendingAction = fetchMoreProducts.pending(requestId);
      const finalState = commerceSearchReducer(state, pendingAction);

      expect(finalState.requestId).toBe(requestId);
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

    it('when parent does not exist, does not change the state', () => {
      const finalState = commerceSearchReducer(state, action);

      expect(finalState).toEqual(state);
    });

    it('when child does not exist, does not change the state', () => {
      state.products = [
        buildMockProduct({permanentid: parentPermanentId, children: []}),
      ];

      const finalState = commerceSearchReducer(state, action);

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

      state.products = [parentProduct];

      const finalState = commerceSearchReducer(state, action);

      expect(finalState.products).toEqual([
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
      error: {message: 'message', statusCode: 500, type: 'type'},
      isLoading: true,
      requestId: 'request-id',
      facets: [buildMockCommerceRegularFacetResponse()],
      products: [
        buildMockProduct({ec_name: 'product1'}),
        buildMockProduct({ec_name: 'product2'}),
      ],
      queryExecuted: 'query',
      responseId: 'response-id',
    };

    const finalState = commerceSearchReducer(state, setView({url: '/'}));

    expect(finalState).toEqual(getCommerceSearchInitialState());
  });

  it('on #setContext, restores the initial state', () => {
    state = {
      error: {message: 'message', statusCode: 500, type: 'type'},
      isLoading: true,
      requestId: 'request-id',
      facets: [buildMockCommerceRegularFacetResponse()],
      products: [
        buildMockProduct({ec_name: 'product1'}),
        buildMockProduct({ec_name: 'product2'}),
      ],
      queryExecuted: 'query',
      responseId: 'response-id',
    };
    const finalState = commerceSearchReducer(
      state,
      setContext({
        country: 'CA',
        currency: 'CAD',
        language: 'fr',
        view: {url: '/'},
      })
    );

    expect(finalState).toEqual(getCommerceSearchInitialState());
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

      const finalState = commerceSearchReducer(state, setError(error));

      expect(finalState.error).toEqual(error);
      expect(finalState.isLoading).toBe(false);
    });
  });
});
