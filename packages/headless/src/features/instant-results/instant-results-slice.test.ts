import {instantResultsReducer} from './instant-results-slice';
import {
  registerInstantResults,
  updateInstantResultsQuery,
} from './instant-results-actions';
import {buildMockResult} from '../../test';
import {InstantResultCache} from './instant-results-state';
import {fetchInstantResults} from '../search/search-actions';

const id1 = 'search_box_1';
const id2 = 'search_box_2';

const getSearchBoxInstantResultsState = (id: string, q = '', cache = {}) => ({
  [id]: {
    q,
    cache,
  },
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
          some_query: {isLoading: true, error: null, results: []},
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
          some_query: {isLoading: true, error: null, results: [], expiresAt: 0},
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
          some_query: {isLoading: false, error: null, results: []},
        });
        const expectedState = getSearchBoxInstantResultsState(id1, query, {
          some_query: {isLoading: true, error: null, results: []},
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
            some_query: {
              isLoading: true,
              error: null,
              results: [],
              expiresAt: 0,
            },
          }),
          ...getSearchBoxInstantResultsState(id2, query),
        };

        expect(instantResultsReducer(initialState, action)).toEqual(
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
      it('updates results in correct searchbox and query cache', () => {
        const query = 'some_query';
        const action = fetchInstantResults.fulfilled(
          {results: [buildMockResult()]},
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
            some_other_query: {isLoading: false, error: null, results: []},
          }),
          ...getSearchBoxInstantResultsState(id2, query, {
            some_query: {isLoading: false, error: null, results: []},
          }),
        });

        const initialState = makeState({
          isLoading: true,
          error: null,
          results: [],
          expiresAt: 0,
        });

        const expectedState = makeState({
          isLoading: false,
          error: null,
          results: [buildMockResult()],
          expiresAt: 0,
        });

        expect(instantResultsReducer(initialState, action)).toEqual(
          expectedState
        );
      });
      it('sets correct isLoading, error and expiresAt properties', () => {
        const query = 'some_query';
        const action = fetchInstantResults.fulfilled(
          {results: [buildMockResult()]},
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
            some_other_query: {isLoading: false, error: null, results: []},
          });

        const initialState = makeState({
          isLoading: true,
          error: null,
          results: [],
          expiresAt: 0,
        });

        const expectedState = makeState({
          isLoading: false,
          error: null,
          results: [buildMockResult()],
          expiresAt: Date.now() + 10000,
        });

        expect(instantResultsReducer(initialState, action)).toEqual(
          expectedState
        );
      });
    });
  });
});
