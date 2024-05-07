import {buildMockCommerceRegularFacetResponse} from '../../../test/mock-commerce-facet-response';
import {buildSearchResponse} from '../../../test/mock-commerce-search';
import {buildMockProduct} from '../../../test/mock-product';
import {executeSearch, fetchMoreProducts} from './search-actions';
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
});
