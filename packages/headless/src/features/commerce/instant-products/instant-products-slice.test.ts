import {CommerceSuccessResponse} from '../../../api/commerce/common/response';
import {buildMockProduct} from '../../../test/mock-product';
import {QueryCommerceAPIThunkReturn} from '../common/actions';
import {fetchInstantProducts} from '../search/search-actions';
import {
  registerInstantProducts,
  updateInstantProductsQuery,
} from './instant-products-actions';
import {instantProductsReducer} from './instant-products-slice';
import {InstantProductsCache} from './instant-products-state';

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
  describe('registerInstantProducts', () => {
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

  describe('updateQuery', () => {
    it('updates query when payload is not an empty string', () => {
      const query = 'some_query';
      const initialState = getSearchBoxInstantProductsState(id1);
      const expectedState = getSearchBoxInstantProductsState(id1, query);
      expect(
        instantProductsReducer(
          initialState,
          updateInstantProductsQuery({id: id1, q: query})
        )
      ).toEqual(expectedState);
    });

    it('does not update query when payload is an empty string', () => {
      const query = 'some_query';

      const initialState = getSearchBoxInstantProductsState(id1, query);

      expect(
        instantProductsReducer(
          initialState,
          updateInstantProductsQuery({id: id1, q: ''})
        )
      ).toEqual(initialState);
    });
  });

  describe('fetchInstantProducts', () => {
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
        jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
      });
      afterAll(() => {
        jest.useRealTimers();
      });
      it('updates products in correct searchbox and query cache', () => {
        const query = 'some_query';
        const action = fetchInstantProducts.fulfilled(
          {
            response: {
              products: [buildMockProduct()],
              pagination: {totalItems: 123},
              responseId: 'someid',
            } as unknown as CommerceSuccessResponse,
          } as QueryCommerceAPIThunkReturn,
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
          products: [buildMockProduct()],
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
              products: [buildMockProduct()],
              pagination: {totalItems: 123},
              responseId: 'someid',
            } as unknown as CommerceSuccessResponse,
          } as QueryCommerceAPIThunkReturn,
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
          products: [buildMockProduct()],
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
    });
  });
});
