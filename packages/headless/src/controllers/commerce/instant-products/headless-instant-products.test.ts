import type {ChildProduct, Product} from '../../../api/commerce/common/product.js';
import {stateKey} from '../../../app/state-key.js';
import {
  clearExpiredProducts,
  promoteChildToParent,
  registerInstantProducts,
  updateInstantProductsQuery,
} from '../../../features/commerce/instant-products/instant-products-actions.js';
import {instantProductsReducer} from '../../../features/commerce/instant-products/instant-products-slice.js';
import {fetchInstantProducts} from '../../../features/commerce/search/search-actions.js';
import type {CommerceAppState} from '../../../state/commerce-app-state.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockCommerceEngine, type MockedCommerceEngine} from '../../../test/mock-engine-v2.js';
import {buildInstantProducts, type InstantProducts} from './headless-instant-products.js';

vi.mock('../../../features/commerce/instant-products/instant-products-actions');
vi.mock('../../../features/commerce/search/search-actions');

describe('instant products', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let instantProducts: InstantProducts;
  const searchBoxId = 'search_box_1';
  const query = 'some query';

  function setInstantProductsState(q: string, cache: Record<string, object> = {}) {
    engine[stateKey].instantProducts![searchBoxId] = {q, cache};
    instantProducts = buildInstantProducts(engine, {options: {searchBoxId}});
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    state = buildMockCommerceState();
    engine = buildMockCommerceEngine(state);
    instantProducts = buildInstantProducts(engine, {options: {searchBoxId}});
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      instantProducts: instantProductsReducer,
    });
  });

  it('registers search box', () => {
    expect(registerInstantProducts).toHaveBeenCalledWith({id: searchBoxId});
  });

  describe('#updateQuery', () => {
    it('does not dispatch any action when query is empty', () => {
      instantProducts.updateQuery('');

      expect(fetchInstantProducts).not.toHaveBeenCalled();
      expect(updateInstantProductsQuery).not.toHaveBeenCalled();
    });

    it('dispatches #fetchInstantProducts and #updateInstantProductsQuery when there is no cached entry', () => {
      setInstantProductsState('', {});

      instantProducts.updateQuery(query);

      expect(fetchInstantProducts).toHaveBeenCalledWith({
        id: searchBoxId,
        q: query,
        cacheTimeout: expect.any(Number),
      });
      expect(updateInstantProductsQuery).toHaveBeenCalledWith({
        id: searchBoxId,
        query,
      });
    });

    it('does not dispatch #fetchInstantProducts when a non-expired, non-errored, loading cache entry exists', () => {
      setInstantProductsState('', {
        [query]: {
          isLoading: true,
          error: null,
          expiresAt: Date.now() + 60000,
          products: [],
        },
      });

      instantProducts.updateQuery(query);

      expect(fetchInstantProducts).not.toHaveBeenCalled();
      expect(updateInstantProductsQuery).toHaveBeenCalledWith({
        id: searchBoxId,
        query,
      });
    });

    it('dispatches #fetchInstantProducts when the cache entry has an error', () => {
      setInstantProductsState('', {
        [query]: {
          isLoading: false,
          error: {message: 'some error'},
          expiresAt: Date.now() + 60000,
          products: [],
        },
      });

      instantProducts.updateQuery(query);

      expect(fetchInstantProducts).toHaveBeenCalledWith({
        id: searchBoxId,
        q: query,
        cacheTimeout: expect.any(Number),
      });
    });

    it('dispatches #fetchInstantProducts when the cache entry has expired', () => {
      const expiredTime = Date.now() - 1;
      setInstantProductsState('', {
        [query]: {
          isLoading: false,
          error: null,
          expiresAt: expiredTime,
          products: [],
        },
      });

      instantProducts.updateQuery(query);

      expect(fetchInstantProducts).toHaveBeenCalledWith({
        id: searchBoxId,
        q: query,
        cacheTimeout: expect.any(Number),
      });
    });
  });

  describe('#clearExpired', () => {
    it('dispatches #clearExpiredProducts with the correct arguments', () => {
      instantProducts.clearExpired();

      expect(clearExpiredProducts).toHaveBeenCalledWith({id: searchBoxId});
    });
  });

  describe('#state', () => {
    it('returns default state when no cache entry exists for the current query', () => {
      setInstantProductsState(query, {});

      expect(instantProducts.state).toEqual({
        query,
        products: [],
        isLoading: false,
        error: null,
        totalCount: 0,
      });
    });

    it('returns products from the cache when available and not loading', () => {
      const products = [{permanentid: 'p1'}] as Product[];
      setInstantProductsState(query, {
        [query]: {
          isLoading: false,
          error: null,
          expiresAt: Date.now() + 60000,
          products,
          totalCountFiltered: 1,
        },
      });

      expect(instantProducts.state.products).toEqual(products);
      expect(instantProducts.state.totalCount).toBe(1);
    });

    it('returns empty products when the cache entry is loading', () => {
      const products = [{permanentid: 'p1'}] as Product[];
      setInstantProductsState(query, {
        [query]: {
          isLoading: true,
          error: null,
          expiresAt: Date.now() + 60000,
          products,
          totalCountFiltered: 1,
        },
      });

      expect(instantProducts.state.products).toEqual([]);
      expect(instantProducts.state.isLoading).toBe(true);
    });

    it('returns error from the cache entry', () => {
      const error = {message: 'some error'};
      setInstantProductsState(query, {
        [query]: {
          isLoading: false,
          error,
          expiresAt: Date.now() + 60000,
          products: [],
          totalCountFiltered: 0,
        },
      });

      expect(instantProducts.state.error).toEqual(error);
    });

    it('returns the current query', () => {
      setInstantProductsState(query, {});

      expect(instantProducts.state.query).toBe(query);
    });
  });

  it('#promoteChildToParent dispatches #promoteChildToParent with the correct arguments', () => {
    const child = {
      permanentid: 'childPermanentId',
    } as ChildProduct;

    engine[stateKey].instantProducts![searchBoxId] = {
      q: query,
      cache: {},
    };
    instantProducts = buildInstantProducts(engine, {options: {searchBoxId}});

    instantProducts.promoteChildToParent(child);

    expect(promoteChildToParent).toHaveBeenCalledWith({
      child,
      id: searchBoxId,
      query,
    });
  });
});
