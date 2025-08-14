import type {ChildProduct} from '../../../api/commerce/common/product.js';
import type {SearchCommerceSuccessResponse} from '../../../api/commerce/search/response.js';
import {
  buildMockBaseProduct,
  buildMockChildProduct,
  buildMockProduct,
} from '../../../test/mock-product.js';
import {
  fetchInstantProducts,
  type QuerySearchCommerceAPIThunkReturn,
} from '../search/search-actions.js';
import {
  promoteChildToParent,
  registerInstantProducts,
  updateInstantProductsQuery,
} from './instant-products-actions.js';
import {instantProductsReducer} from './instant-products-slice.js';
import type {
  InstantProductsCache,
  InstantProductsState,
} from './instant-products-state.js';

const id1 = 'search_box_1';
const id2 = 'search_box_2';

const getSearchBoxInstantProductsState = (
  id: string,
  q = '',
  cache: Record<string, InstantProductsCache> = {}
) => ({
  [id]: {
    q,
    cache,
  },
});

const initialEmptyCache: () => InstantProductsCache = () => ({
  isLoading: true,
  error: null,
  products: [],
  expiresAt: 0,
  isActive: true,
  searchUid: '',
  totalCountFiltered: 0,
  duration: 0,
});

describe('instant products slice', () => {
  describe('on #registerInstantProducts', () => {
    it('registers one search box instant products cache', () => {
      const expectedState = getSearchBoxInstantProductsState(id1);
      expect(
        instantProductsReducer({}, registerInstantProducts({id: id1}))
      ).toEqual(expectedState);
    });
    it('registers multiple search box instant products cache', () => {
      const expectedState = {
        ...getSearchBoxInstantProductsState(id1),
        ...getSearchBoxInstantProductsState(id2),
      };
      const newState = instantProductsReducer(
        {},
        registerInstantProducts({id: id1})
      );
      expect(
        instantProductsReducer(newState, registerInstantProducts({id: id2}))
      ).toEqual(expectedState);
    });
    it('does not override an existing search box', () => {
      const searchBox1 = () =>
        getSearchBoxInstantProductsState(id1, 'some_query', {
          some_query: initialEmptyCache(),
        });

      expect(
        instantProductsReducer(searchBox1(), registerInstantProducts({id: id1}))
      ).toEqual(searchBox1());
    });
  });

  describe('on #updateQuery', () => {
    it('updates query when payload is not an empty string', () => {
      const query = 'some_query';
      const initialState = getSearchBoxInstantProductsState(id1);
      const expectedState = getSearchBoxInstantProductsState(id1, query);
      expect(
        instantProductsReducer(
          initialState,
          updateInstantProductsQuery({id: id1, query: query})
        )
      ).toEqual(expectedState);
    });

    it('does not update query when payload is an empty string', () => {
      const query = 'some_query';

      const initialState = getSearchBoxInstantProductsState(id1, query);

      expect(
        instantProductsReducer(
          initialState,
          updateInstantProductsQuery({id: id1, query: ''})
        )
      ).toEqual(initialState);
    });
  });

  describe('on #fetchInstantProducts', () => {
    describe('when pending', () => {
      it('creates new cache when one does not exist', () => {
        const query = 'some_query';
        const action = fetchInstantProducts.pending('req_id', {
          id: id1,
          q: query,
        });

        const initialState = getSearchBoxInstantProductsState(id1, query);
        const expectedState = getSearchBoxInstantProductsState(id1, query, {
          some_query: initialEmptyCache(),
        });

        expect(instantProductsReducer(initialState, action)).toEqual(
          expectedState
        );
      });

      it('updates cache when one already exists', () => {
        const query = 'some_query';
        const action = fetchInstantProducts.pending('req_id', {
          id: id1,
          q: query,
        });

        const initialState = getSearchBoxInstantProductsState(id1, query, {
          some_query: initialEmptyCache(),
        });
        const expectedState = getSearchBoxInstantProductsState(id1, query, {
          some_query: initialEmptyCache(),
        });

        expect(instantProductsReducer(initialState, action)).toEqual(
          expectedState
        );
      });

      it('creates cache in correct search box', () => {
        const query = 'some_query';
        const action = fetchInstantProducts.pending('req_id', {
          id: id1,
          q: query,
        });

        const initialState = {
          ...getSearchBoxInstantProductsState(id1, query),
          ...getSearchBoxInstantProductsState(id2, query),
        };
        const expectedState = {
          ...getSearchBoxInstantProductsState(id1, query, {
            some_query: initialEmptyCache(),
          }),
          ...getSearchBoxInstantProductsState(id2, query),
        };

        expect(instantProductsReducer(initialState, action)).toEqual(
          expectedState
        );
      });

      it('set isActive of all previous caches to false', () => {
        const query = 'some_query';
        const action = fetchInstantProducts.pending('req_id', {
          id: id1,
          q: query,
        });

        const initialState = {
          ...getSearchBoxInstantProductsState(id1, query, {
            another_query: initialEmptyCache(),
          }),
        };
        const expectedState = {
          ...getSearchBoxInstantProductsState(id1, query, {
            some_query: initialEmptyCache(),
            another_query: {...initialEmptyCache(), isActive: false},
          }),
        };

        expect(instantProductsReducer(initialState, action)).toEqual(
          expectedState
        );
      });
    });

    describe('when fulfilled', () => {
      beforeEach(() => {
        vi.useFakeTimers().setSystemTime(new Date('2020-01-01'));
      });
      afterAll(() => {
        vi.useRealTimers();
      });
      it('updates products in correct searchbox and query cache', () => {
        const query = 'some_query';
        const action = fetchInstantProducts.fulfilled(
          {
            response: {
              products: [buildMockBaseProduct()],
              pagination: {totalEntries: 123},
              responseId: 'someid',
            } as unknown as SearchCommerceSuccessResponse,
          } as QuerySearchCommerceAPIThunkReturn,
          'req_id',
          {
            id: id1,
            q: query,
          }
        );

        const makeState = (some_query: InstantProductsCache) => ({
          ...getSearchBoxInstantProductsState(id1, query, {
            some_query,
            some_other_query: initialEmptyCache(),
          }),
          ...getSearchBoxInstantProductsState(id2, query, {
            some_query: initialEmptyCache(),
          }),
        });

        const initialState = makeState(initialEmptyCache());

        const expectedState = makeState({
          isLoading: false,
          error: null,
          products: [buildMockProduct({responseId: 'someid'})],
          expiresAt: 0,
          isActive: true,
          searchUid: 'someid',
          totalCountFiltered: 123,
          duration: 0,
        });

        expect(instantProductsReducer(initialState, action)).toEqual(
          expectedState
        );
      });
      it('sets correct isLoading, error and expiresAt properties', () => {
        const query = 'some_query';
        const action = fetchInstantProducts.fulfilled(
          {
            response: {
              products: [buildMockBaseProduct()],
              pagination: {totalEntries: 123},
              responseId: 'someid',
            } as unknown as SearchCommerceSuccessResponse,
          } as QuerySearchCommerceAPIThunkReturn,
          'req_id',
          {
            id: id1,
            q: query,
            cacheTimeout: 10000,
          }
        );

        const makeState = (some_query: InstantProductsCache) =>
          getSearchBoxInstantProductsState(id1, query, {
            some_query,
            some_other_query: initialEmptyCache(),
          });

        const initialState = makeState(initialEmptyCache());

        const expectedState = makeState({
          isLoading: false,
          error: null,
          products: [buildMockProduct({responseId: 'someid'})],
          expiresAt: Date.now() + 10000,
          isActive: true,
          searchUid: 'someid',
          duration: 0,
          totalCountFiltered: 123,
        });

        expect(instantProductsReducer(initialState, action)).toEqual(
          expectedState
        );
      });

      it('sets the #position of each product to its 1-based position in the unpaginated list', () => {
        const query = 'some_query';
        const action = fetchInstantProducts.fulfilled(
          {
            response: {
              products: [
                buildMockBaseProduct({ec_name: 'product1'}),
                buildMockBaseProduct({ec_name: 'product2'}),
              ],
              pagination: {totalEntries: 22},
              responseId: 'someid',
            } as unknown as SearchCommerceSuccessResponse,
          } as QuerySearchCommerceAPIThunkReturn,
          'req_id',
          {
            id: id1,
            q: query,
            cacheTimeout: 10000,
          }
        );

        const makeState = (some_query: InstantProductsCache) =>
          getSearchBoxInstantProductsState(id1, query, {
            some_query,
            some_other_query: initialEmptyCache(),
          });

        const initialState = makeState(initialEmptyCache());

        const expectedState = makeState({
          isLoading: false,
          error: null,
          products: [
            buildMockProduct({
              ec_name: 'product1',
              position: 1,
              responseId: 'someid',
            }),
            buildMockProduct({
              ec_name: 'product2',
              position: 2,
              responseId: 'someid',
            }),
          ],
          expiresAt: Date.now() + 10000,
          isActive: true,
          searchUid: 'someid',
          duration: 0,
          totalCountFiltered: 22,
        });

        expect(instantProductsReducer(initialState, action)).toEqual(
          expectedState
        );
      });

      it('assigns responseId from response to all products during preprocessing', () => {
        const query = 'some_query';
        const apiProducts = [
          buildMockBaseProduct({ec_name: 'product1'}),
          buildMockBaseProduct({ec_name: 'product2'}),
        ];
        const responseId = 'response-from-api';

        const action = fetchInstantProducts.fulfilled(
          {
            response: {
              products: apiProducts,
              pagination: {totalEntries: 2},
              responseId,
            } as unknown as SearchCommerceSuccessResponse,
          } as QuerySearchCommerceAPIThunkReturn,
          'req_id',
          {
            id: id1,
            q: query,
          }
        );

        const initialState = getSearchBoxInstantProductsState(id1, query, {
          [query]: initialEmptyCache(),
        });

        const finalState = instantProductsReducer(initialState, action);

        expect(finalState[id1].cache[query].products[0].responseId).toBe(
          responseId
        );
        expect(finalState[id1].cache[query].products[1].responseId).toBe(
          responseId
        );
      });
    });
  });

  describe('on #promoteChildToParent', () => {
    const permanentid = 'child-id';
    const parentPermanentId = 'parent-id';
    const id: string = id1;
    const query = 'some_query';
    let action: ReturnType<typeof promoteChildToParent>;
    let state: InstantProductsState;

    beforeEach(() => {
      action = promoteChildToParent({
        child: {permanentid} as ChildProduct,
        id,
        query,
      });

      state = getSearchBoxInstantProductsState(id, query, {
        [query]: {
          duration: 0,
          error: {},
          expiresAt: 0,
          isActive: true,
          isLoading: false,
          products: [],
          searchUid: '',
          totalCountFiltered: 0,
        },
      });
    });

    it('when cache does not exist for query, it does not change the state', () => {
      state[id]!.cache = {};

      const finalState = instantProductsReducer(state, action);

      expect(finalState).toEqual(state);
    });

    it('when parent does not exist in cache for query, it does not change the state', () => {
      const finalState = instantProductsReducer(state, action);

      expect(finalState).toEqual(state);
    });

    it('when child does not exist in cache for query, it does not change the state', () => {
      state[id]!.cache[query].products = [
        buildMockProduct({permanentid: parentPermanentId, children: []}),
      ];

      const finalState = instantProductsReducer(state, action);

      expect(finalState).toEqual(state);
    });

    it('when both parent and child exist in cache for query, promotes the child to parent', () => {
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
        permanentid: 'parent-id',
        children: [childProduct],
        totalNumberOfChildren: 1,
        position: 5,
        responseId: 'test-response-id',
      });

      state[id]!.cache[query].products = [parentProduct];

      const finalState = instantProductsReducer(state, action);

      expect(finalState[id].cache[query].products).toEqual([
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
});
