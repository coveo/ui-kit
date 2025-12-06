import type {
  ChildProduct,
  Product,
} from '../../../api/commerce/common/product.js';
import {buildMockCommerceRegularFacetResponse} from '../../../test/mock-commerce-facet-response.js';
import {
  buildMockBaseProduct,
  buildMockChildProduct,
  buildMockProduct,
} from '../../../test/mock-product.js';
import {buildFetchProductListingResponse} from '../../../test/mock-product-listing.js';
import {
  buildMockBaseSpotlightContent,
  buildMockSpotlightContent,
} from '../../../test/mock-spotlight-content.js';
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
    describe('when products list has entries', () => {
      it('updates the product listing state with the received payload', () => {
        const result = buildMockBaseProduct({ec_name: 'product1'});
        const facet = buildMockCommerceRegularFacetResponse();
        const responseId = 'some-response-id';
        const response = buildFetchProductListingResponse({
          products: [result],
          facets: [facet],
          responseId,
        });

        const action = fetchProductListing.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);

        expect(finalState.products).toEqual(
          response.response.products.map((p) =>
            buildMockProduct({ec_name: p.ec_name, responseId})
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

        const action = fetchProductListing.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);

        expect(finalState.products[0].position).toBe(21);
        expect(finalState.products[1].position).toBe(22);
      });

      it('sets the responseId on each product', () => {
        const products = [
          buildMockBaseProduct({ec_name: 'product1'}),
          buildMockBaseProduct({ec_name: 'product2'}),
        ];
        const responseId = 'some-response-id';
        const response = buildFetchProductListingResponse({
          products,
          responseId,
        });

        const action = fetchProductListing.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);

        expect(finalState.products[0].responseId).toBe(responseId);
        expect(finalState.products[1].responseId).toBe(responseId);
      });

      it('set #error to null ', () => {
        state.error = {message: 'message', statusCode: 500, type: 'type'};

        const response = buildFetchProductListingResponse();

        const action = fetchProductListing.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);
        expect(finalState.error).toBeNull();
      });
    });

    describe('when results list has entries', () => {
      it('updates the results field with products and spotlight content', () => {
        const product = buildMockBaseProduct({ec_name: 'product1'});
        const spotlight = buildMockBaseSpotlightContent({name: 'Spotlight 1'});
        const responseId = 'some-response-id';
        const response = buildFetchProductListingResponse({
          results: [product, spotlight],
          responseId,
        });

        const action = fetchProductListing.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);

        expect(finalState.results).toHaveLength(2);
        expect(finalState.results[0]).toEqual(
          buildMockProduct({ec_name: 'product1', position: 1, responseId})
        );
        expect(finalState.results[1]).toEqual(
          buildMockSpotlightContent({
            name: 'Spotlight 1',
            position: 2,
            responseId,
          })
        );
      });

      it('sets the #position of each result in results to its 1-based position', () => {
        const product1 = buildMockBaseProduct({ec_name: 'product1'});
        const spotlight = buildMockBaseSpotlightContent({name: 'Spotlight 1'});
        const product2 = buildMockBaseProduct({ec_name: 'product2'});
        const response = buildFetchProductListingResponse({
          results: [product1, spotlight, product2],
          pagination: {
            page: 1,
            perPage: 10,
            totalEntries: 23,
            totalPages: 3,
          },
        });

        const action = fetchProductListing.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);

        expect(finalState.results[0].position).toBe(11);
        expect(finalState.results[1].position).toBe(12);
        expect(finalState.results[2].position).toBe(13);
      });

      it('sets the responseId on each result in results', () => {
        const product = buildMockBaseProduct({ec_name: 'product1'});
        const spotlight = buildMockBaseSpotlightContent({name: 'Spotlight 1'});
        const responseId = 'test-response-id';
        const response = buildFetchProductListingResponse({
          results: [product, spotlight],
          responseId,
        });

        const action = fetchProductListing.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);

        expect(finalState.results[0].responseId).toBe(responseId);
        expect(finalState.results[1].responseId).toBe(responseId);
      });

      it('keeps results empty when response.results is empty', () => {
        const product = buildMockBaseProduct({ec_name: 'product1'});
        const response = buildFetchProductListingResponse({
          products: [product],
          results: [],
        });

        const action = fetchProductListing.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);

        expect(finalState.products).toHaveLength(1);
        expect(finalState.results).toHaveLength(0);
      });
    });
  });

  describe('on #fetchMoreProducts.fulfilled', () => {
    describe('when products list has entries', () => {
      it('appends the received products to the product listing state', () => {
        state.products = [
          buildMockProduct({
            ec_name: 'product1',
            responseId: 'old-response-id',
          }),
          buildMockProduct({
            ec_name: 'product2',
            responseId: 'old-response-id',
          }),
        ];
        const result = buildMockBaseProduct({ec_name: 'product3'});
        const facet = buildMockCommerceRegularFacetResponse();
        const responseId = 'some-response-id';
        const response = buildFetchProductListingResponse({
          products: [result],
          facets: [facet],
          responseId,
        });

        const action = fetchMoreProducts.fulfilled(response, '', {});
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

        const action = fetchMoreProducts.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);

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
        const newProduct = buildMockBaseProduct({ec_name: 'product3'});
        const responseId = 'new-response-id';
        const response = buildFetchProductListingResponse({
          products: [newProduct],
          responseId,
          pagination: {
            page: 1,
            perPage: 2,
            totalEntries: 22,
            totalPages: 3,
          },
        });

        const action = fetchMoreProducts.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);

        // Original products keep their responseId
        expect(finalState.products[0].responseId).toBe('old-response-id');
        expect(finalState.products[1].responseId).toBe('old-response-id');
        // New products get the new responseId
        expect(finalState.products[2].responseId).toBe(responseId);
      });

      it('set #error to null', () => {
        state.error = {message: 'message', statusCode: 500, type: 'type'};

        const response = buildFetchProductListingResponse();
        const action = fetchMoreProducts.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);
        expect(finalState.error).toBeNull();
      });
    });

    describe('when results list has entries', () => {
      it('appends the received results (products and spotlight content) to the results state', () => {
        const product1 = buildMockProduct({
          ec_name: 'product1',
          responseId: 'old-response-id',
          position: 1,
        });
        const spotlight1 = buildMockSpotlightContent({
          name: 'Spotlight 1',
          position: 2,
        });
        state.results = [product1, spotlight1];

        const product2 = buildMockBaseProduct({ec_name: 'product2'});
        const spotlight2 = buildMockBaseSpotlightContent({name: 'Spotlight 2'});
        const responseId = 'new-response-id';
        const response = buildFetchProductListingResponse({
          results: [product2, spotlight2],
          responseId,
          pagination: {
            page: 1,
            perPage: 2,
            totalEntries: 4,
            totalPages: 2,
          },
        });

        const action = fetchMoreProducts.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);

        expect(finalState.results).toHaveLength(4);
        expect(finalState.results[0]).toEqual(product1);
        expect(finalState.results[1]).toEqual(spotlight1);
        expect(finalState.results[2]).toEqual(
          buildMockProduct({ec_name: 'product2', position: 3, responseId})
        );
        expect(finalState.results[3]).toEqual(
          buildMockSpotlightContent({
            name: 'Spotlight 2',
            position: 4,
            responseId,
          })
        );
      });

      it('sets the #position of each product in results to its 1-based position in the unpaginated list', () => {
        const product1 = buildMockProduct({
          ec_name: 'product1',
          position: 1,
        });
        const spotlight = buildMockSpotlightContent({name: 'Spotlight 1'});
        state.results = [product1, spotlight];

        const product2 = buildMockBaseProduct({ec_name: 'product2'});
        const response = buildFetchProductListingResponse({
          results: [product2],
          pagination: {
            page: 1,
            perPage: 2,
            totalEntries: 3,
            totalPages: 2,
          },
        });

        const action = fetchMoreProducts.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);

        expect((finalState.results[0] as Product).position).toBe(1);
        expect(finalState.results[1]).toEqual(spotlight);
        expect((finalState.results[2] as Product).position).toBe(3);
      });

      it('sets the responseId on new results in results while preserving the responseId of the existing ones', () => {
        const oldResponseId = 'old-response-id';
        const product1 = buildMockProduct({
          ec_name: 'product1',
          position: 1,
          responseId: oldResponseId,
        });
        const spotlight1 = buildMockSpotlightContent({
          name: 'Spotlight 1',
          position: 1,
          responseId: oldResponseId,
        });
        state.results = [product1, spotlight1];

        const product2 = buildMockBaseProduct({ec_name: 'product2'});
        const spotlight = buildMockBaseSpotlightContent({name: 'Spotlight 1'});
        const responseId = 'new-response-id';
        const response = buildFetchProductListingResponse({
          results: [product2, spotlight],
          responseId,
          pagination: {
            page: 1,
            perPage: 1,
            totalEntries: 3,
            totalPages: 3,
          },
        });

        const action = fetchMoreProducts.fulfilled(response, '', {});
        const finalState = productListingReducer(state, action);

        expect(finalState.results).toHaveLength(4);
        expect(finalState.results[0].responseId).toBe(oldResponseId);
        expect(finalState.results[1].responseId).toBe(oldResponseId);
        expect(finalState.results[2].responseId).toBe(responseId);
        expect(finalState.results[3].responseId).toBe(responseId);
      });
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
      const pendingAction = fetchProductListing.pending('', {});
      const finalState = productListingReducer(state, pendingAction);
      expect(finalState.isLoading).toBe(true);
    });

    it('sets #requestId', () => {
      const pendingAction = fetchProductListing.pending('request-id', {});
      const finalState = productListingReducer(state, pendingAction);
      expect(finalState.requestId).toBe('request-id');
    });
  });

  describe('on #fetchMoreProducts.pending', () => {
    it('sets #isLoading to true', () => {
      const pendingAction = fetchMoreProducts.pending('', {});
      const finalState = productListingReducer(state, pendingAction);
      expect(finalState.isLoading).toBe(true);
    });

    it('sets #requestId', () => {
      const pendingAction = fetchMoreProducts.pending('request-id', {});
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

    describe('when products list has entries', () => {
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

        const finalState = productListingReducer(state, action);

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

    describe('when results list has entries', () => {
      it('when both parent and child exist in results, promotes the child to parent', () => {
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
          position: 3,
          responseId: 'test-response-id',
        });

        const spotlight = buildMockSpotlightContent({name: 'Spotlight 1'});
        state.results = [parentProduct, spotlight];

        const finalState = productListingReducer(state, action);

        expect(finalState.results).toHaveLength(2);
        expect(finalState.results[0]).toEqual(
          buildMockProduct({
            ...childProduct,
            children: parentProduct.children,
            totalNumberOfChildren: parentProduct.totalNumberOfChildren,
            position: parentProduct.position,
            responseId: parentProduct.responseId,
          })
        );
        expect(finalState.results[1]).toEqual(spotlight);
      });

      it('when results contain spotlight content, skips spotlight when searching for parent', () => {
        const childProduct = buildMockChildProduct({
          permanentid,
          ec_name: 'child name',
        });

        const parentProduct = buildMockProduct({
          permanentid: parentPermanentId,
          children: [childProduct],
          totalNumberOfChildren: 1,
          position: 2,
          responseId: 'test-response-id',
        });

        const spotlight = buildMockSpotlightContent({name: 'Spotlight 1'});
        state.results = [spotlight, parentProduct];

        const finalState = productListingReducer(state, action);

        expect(finalState.results).toHaveLength(2);
        expect(finalState.results[0]).toEqual(spotlight);
        expect((finalState.results[1] as Product).permanentid).toBe(
          permanentid
        );
      });
    });
  });

  it('on #setView, restores the initial state', () => {
    state = {
      error: {message: 'error', statusCode: 500, type: 'type'},
      isLoading: true,
      products: [buildMockProduct({ec_name: 'product1'})],
      results: [],
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
      results: [],
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
