import {buildMockCommerceRegularFacetResponse} from '../../../test/mock-commerce-facet-response';
import {buildSearchResponse} from '../../../test/mock-commerce-search';
import {buildMockProduct} from '../../../test/mock-product';
import {
  executeSearch,
  fetchMoreProducts,
  promoteChildToParent,
} from './search-actions';
import {commerceSearchReducer} from './search-slice';
import {
  CommerceSearchState,
  getCommerceSearchInitialState,
} from './search-state';

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

  describe('when executeSearch.fulfilled', () => {
    it('it updates the state with the received payload', () => {
      const products = [buildMockProduct()];
      const facets = [buildMockCommerceRegularFacetResponse()];
      const responseId = 'some-response-id';
      const response = buildSearchResponse({
        products,
        facets,
        responseId,
      });

      const action = executeSearch.fulfilled(response, '');
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.products).toEqual(products);
      expect(finalState.facets).toEqual(facets);
      expect(finalState.responseId).toEqual(responseId);
      expect(finalState.isLoading).toBe(false);
    });

    it('set the error to null on success', () => {
      state.error = {message: 'message', statusCode: 500, type: 'type'};

      const response = buildSearchResponse();

      const action = executeSearch.fulfilled(response, '');
      const finalState = commerceSearchReducer(state, action);
      expect(finalState.error).toBeNull();
    });
  });

  describe('when fetchMoreProducts.fulfilled', () => {
    it('it updates the state with the received payload', () => {
      state.products = [
        buildMockProduct({ec_name: 'product1'}),
        buildMockProduct({ec_name: 'product2'}),
      ];
      const newProducts = [
        buildMockProduct({ec_name: 'product3'}),
        buildMockProduct({ec_name: 'product4'}),
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

    it('set the error to null on success', () => {
      state.error = {message: 'message', statusCode: 500, type: 'type'};

      const response = buildSearchResponse();

      const action = fetchMoreProducts.fulfilled(response, '');
      const finalState = commerceSearchReducer(state, action);
      expect(finalState.error).toBeNull();
    });
  });

  describe('when executeSearch.rejected', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };

    it('sets the error', () => {
      const action = {type: executeSearch.rejected.type, payload: err};
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.error).toEqual(err);
      expect(finalState.isLoading).toBe(false);
    });

    it('sets isLoading to false', () => {
      state.isLoading = true;

      const action = {type: executeSearch.rejected.type, payload: err};
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.error).toEqual(err);
      expect(finalState.isLoading).toBe(false);
    });
  });

  describe('when fetchMoreProducts.rejected', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };

    it('sets the error', () => {
      const action = {type: fetchMoreProducts.rejected.type, payload: err};
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.error).toEqual(err);
      expect(finalState.isLoading).toBe(false);
    });

    it('sets isLoading to false', () => {
      state.isLoading = true;

      const action = {type: fetchMoreProducts.rejected.type, payload: err};
      const finalState = commerceSearchReducer(state, action);

      expect(finalState.error).toEqual(err);
      expect(finalState.isLoading).toBe(false);
    });
  });

  describe('when executeSearch.pending', () => {
    it('sets isLoading to true', () => {
      state.isLoading = false;

      const pendingAction = executeSearch.pending('');
      const finalState = commerceSearchReducer(state, pendingAction);

      expect(finalState.isLoading).toBe(true);
    });
  });

  describe('when fetchMoreProducts.pending', () => {
    it('sets isLoading to true', () => {
      state.isLoading = false;

      const pendingAction = fetchMoreProducts.pending('');
      const finalState = commerceSearchReducer(state, pendingAction);

      expect(finalState.isLoading).toBe(true);
    });
  });

  describe('on #promoteChildToParent', () => {
    const childPermanentId = 'child-id';
    const parentPermanentId = 'parent-id';
    let action: ReturnType<typeof promoteChildToParent>;

    beforeEach(() => {
      action = promoteChildToParent({
        childPermanentId,
        parentPermanentId,
      });
    });

    it('when parent does not exist, it does not change the state', () => {
      const finalState = commerceSearchReducer(state, action);

      expect(finalState).toEqual(state);
    });

    it('when child does not exist, it does not change the state', () => {
      state.products = [
        buildMockProduct({permanentid: parentPermanentId, children: []}),
      ];

      const finalState = commerceSearchReducer(state, action);

      expect(finalState).toEqual(state);
    });

    it('when both parent and child exist, promotes the child to parent', () => {
      const childProduct = buildMockProduct({
        permanentid: childPermanentId,
        additionalFields: {test: 'test'},
        clickUri: 'child-uri',
        ec_brand: 'child brand',
        ec_category: 'child category',
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
      });

      state.products = [parentProduct];

      const finalState = commerceSearchReducer(state, action);

      expect(finalState.products).toEqual([
        buildMockProduct({
          ...childProduct,
          children: parentProduct.children,
          totalNumberOfChildren: parentProduct.totalNumberOfChildren,
        }),
      ]);
    });
  });
});
