import {buildMockResult} from '../../test/mock-result.js';
import {fetchInstantResults} from '../search/search-actions.js';
import {
  registerInstantResults,
  updateInstantResultsQuery,
} from './instant-results-actions.js';
import {instantResultsReducer} from './instant-results-slice.js';
import type {InstantResultCache} from './instant-results-state.js';

const id1 = 'search_box_1';
const id2 = 'search_box_2';

const getSearchBoxInstantResultsState = (
  id: string,
  q = '',
  cache: Record<string, InstantResultCache> = {}
) => ({
  [id]: {
    q,
    cache,
  },
});

const initialEmptyCache: () => InstantResultCache = () => ({
  isLoading: true,
  error: null,
  results: [],
  expiresAt: 0,
  isActive: true,
  searchUid: '',
  totalCountFiltered: 0,
  duration: 0,
});

describe('instant results slice', () => {
  describe('registerInstantResults', () => {
    it('registers one search box instant results cache', () => {
      const expectedState = getSearchBoxInstantResultsState(id1);
      expect(
        instantResultsReducer({}, registerInstantResults({id: id1}))
      ).toEqual(expectedState);
    });
    it('registers multiple search box instant results cache', () => {
      const expectedState = {
        ...getSearchBoxInstantResultsState(id1),
        ...getSearchBoxInstantResultsState(id2),
      };
      const newState = instantResultsReducer(
        {},
        registerInstantResults({id: id1})
      );
      expect(
        instantResultsReducer(newState, registerInstantResults({id: id2}))
      ).toEqual(expectedState);
    });
    it('does not override an existing search box', () => {
      const searchBox1 = () =>
        getSearchBoxInstantResultsState(id1, 'some_query', {
          some_query: initialEmptyCache(),
        });

      expect(
        instantResultsReducer(searchBox1(), registerInstantResults({id: id1}))
      ).toEqual(searchBox1());
    });
  });

  describe('updateQuery', () => {
    it('updates query when payload is not an empty string', () => {
      const query = 'some_query';
      const initialState = getSearchBoxInstantResultsState(id1);
      const expectedState = getSearchBoxInstantResultsState(id1, query);
      expect(
        instantResultsReducer(
          initialState,
          updateInstantResultsQuery({id: id1, q: query})
        )
      ).toEqual(expectedState);
    });

    it('does not update query when payload is an empty string', () => {
      const query = 'some_query';

      const initialState = getSearchBoxInstantResultsState(id1, query);

      expect(
        instantResultsReducer(
          initialState,
          updateInstantResultsQuery({id: id1, q: ''})
        )
      ).toEqual(initialState);
    });
  });

  describe('fetchInstantResults', () => {
    describe('when pending', () => {
      it('creates new cache when one does not exist', () => {
        const query = 'some_query';
        const action = fetchInstantResults.pending('req_id', {
          id: id1,
          q: query,
          maxResultsPerQuery: 2,
        });

        const initialState = getSearchBoxInstantResultsState(id1, query);
        const expectedState = getSearchBoxInstantResultsState(id1, query, {
          some_query: initialEmptyCache(),
        });

        expect(instantResultsReducer(initialState, action)).toEqual(
          expectedState
        );
      });

      it('updates cache when one already exists', () => {
        const query = 'some_query';
        const action = fetchInstantResults.pending('req_id', {
          id: id1,
          q: query,
          maxResultsPerQuery: 2,
        });

        const initialState = getSearchBoxInstantResultsState(id1, query, {
          some_query: initialEmptyCache(),
        });
        const expectedState = getSearchBoxInstantResultsState(id1, query, {
          some_query: initialEmptyCache(),
        });

        expect(instantResultsReducer(initialState, action)).toEqual(
          expectedState
        );
      });

      it('creates cache in correct search box', () => {
        const query = 'some_query';
        const action = fetchInstantResults.pending('req_id', {
          id: id1,
          q: query,
          maxResultsPerQuery: 2,
        });

        const initialState = {
          ...getSearchBoxInstantResultsState(id1, query),
          ...getSearchBoxInstantResultsState(id2, query),
        };
        const expectedState = {
          ...getSearchBoxInstantResultsState(id1, query, {
            some_query: initialEmptyCache(),
          }),
          ...getSearchBoxInstantResultsState(id2, query),
        };

        expect(instantResultsReducer(initialState, action)).toEqual(
          expectedState
        );
      });

      it('set isActive of all previous caches to false', () => {
        const query = 'some_query';
        const action = fetchInstantResults.pending('req_id', {
          id: id1,
          q: query,
          maxResultsPerQuery: 2,
        });

        const initialState = {
          ...getSearchBoxInstantResultsState(id1, query, {
            another_query: initialEmptyCache(),
          }),
        };
        const expectedState = {
          ...getSearchBoxInstantResultsState(id1, query, {
            some_query: initialEmptyCache(),
            another_query: {...initialEmptyCache(), isActive: false},
          }),
        };

        expect(instantResultsReducer(initialState, action)).toEqual(
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
      it('updates results in correct searchbox and query cache', () => {
        const query = 'some_query';
        const action = fetchInstantResults.fulfilled(
          {
            results: [buildMockResult({searchUid: 'someid'})],
            searchUid: 'someid',
            totalCountFiltered: 1,
            duration: 2,
          },
          'req_id',
          {
            id: id1,
            q: query,
            maxResultsPerQuery: 2,
          }
        );

        const makeState = (some_query: InstantResultCache) => ({
          ...getSearchBoxInstantResultsState(id1, query, {
            some_query,
            some_other_query: initialEmptyCache(),
          }),
          ...getSearchBoxInstantResultsState(id2, query, {
            some_query: initialEmptyCache(),
          }),
        });

        const initialState = makeState(initialEmptyCache());

        const expectedState = makeState({
          isLoading: false,
          error: null,
          results: [buildMockResult({searchUid: 'someid'})],
          expiresAt: 0,
          isActive: true,
          searchUid: 'someid',
          totalCountFiltered: 1,
          duration: 2,
        });

        expect(instantResultsReducer(initialState, action)).toEqual(
          expectedState
        );
      });

      it('sets correct isLoading, error, searchUid and expiresAt properties', () => {
        const query = 'some_query';
        const action = fetchInstantResults.fulfilled(
          {
            results: [buildMockResult()],
            searchUid: 'someid',
            duration: 1,
            totalCountFiltered: 2,
          },
          'req_id',
          {
            id: id1,
            q: query,
            maxResultsPerQuery: 2,
            cacheTimeout: 10000,
          }
        );

        const makeState = (some_query: InstantResultCache) =>
          getSearchBoxInstantResultsState(id1, query, {
            some_query,
            some_other_query: initialEmptyCache(),
          });

        const initialState = makeState(initialEmptyCache());

        const expectedState = makeState({
          isLoading: false,
          error: null,
          results: [buildMockResult({searchUid: 'someid'})],
          expiresAt: Date.now() + 10000,
          isActive: true,
          searchUid: 'someid',
          duration: 1,
          totalCountFiltered: 2,
        });

        expect(instantResultsReducer(initialState, action)).toEqual(
          expectedState
        );
      });
    });
  });
});
