import type {QuerySuggestCompletion} from '../../api/search/query-suggest/query-suggest-response.js';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest.js';
import {buildMockQuerySuggestCompletion} from '../../test/mock-query-suggest-completion.js';
import {buildMockSearchApiErrorWithStatusCode} from '../../test/mock-search-api-error-with-status-code.js';
import {
  clearQuerySuggest as clearCommerceQuerySuggest,
  fetchQuerySuggestions as fetchCommerceQuerySuggestions,
  registerQuerySuggest as registerCommerceQuerySuggest,
} from '../commerce/query-suggest/query-suggest-actions.js';
import {setError} from '../error/error-actions.js';
import {
  clearQuerySuggest,
  fetchQuerySuggestions,
  registerQuerySuggest,
} from './query-suggest-actions.js';
import {querySuggestReducer} from './query-suggest-slice.js';
import type {QuerySuggestSet} from './query-suggest-state.js';

describe('querySuggest slice', () => {
  let state: QuerySuggestSet;
  const id = 'searchBox_1234';
  const anotherId = 'searchBox_6789';

  function getCompletions(executableConfidence = 1, score = 999) {
    const completions: QuerySuggestCompletion[] = [];
    for (let index = 0; index < 5; index++) {
      completions.push({
        expression: 'test completion',
        executableConfidence,
        highlighted: 'test completion',
        score,
      });
    }

    return completions;
  }

  beforeEach(() => {
    state = {
      [id]: buildMockQuerySuggest(),
      [anotherId]: buildMockQuerySuggest({
        completions: [buildMockQuerySuggestCompletion()],
        partialQueries: ['n', 'i', 'c'],
      }),
    };
  });

  it('should have initial state', () => {
    expect(querySuggestReducer(undefined, {type: 'randomAction'})).toEqual({});
  });

  const describeRegister = (
    register: typeof registerQuerySuggest | typeof registerCommerceQuerySuggest
  ) => {
    it('when the id does not exist, it adds an entry with the correct state', () => {
      const expectedState = buildMockQuerySuggest({id, count: 10});
      const action = register({id, count: 10});
      const finalState = querySuggestReducer(undefined, action);

      expect(finalState[id]).toEqual(expectedState);
    });

    it('when the id exists, it does not modify the registered state', () => {
      const action = register({id, count: 10});
      const finalState = querySuggestReducer(state, action);

      expect(state[id]).toEqual(finalState[id]);
    });
  };

  describe('#registerQuerySuggest', () => {
    describeRegister(registerQuerySuggest);
  });

  describe('#registerCommerceQuerySuggest', () => {
    describeRegister(registerCommerceQuerySuggest);
  });

  const describeClear = (
    clear: typeof clearQuerySuggest | typeof clearCommerceQuerySuggest
  ) => {
    it('when the id is valid, it clears completions, responseId and partialQueries, but not the query', () => {
      state[id] = buildMockQuerySuggest({
        completions: getCompletions(),
        partialQueries: ['s', 'so', 'som', 'some'],
        responseId: 'response-uuid',
      });

      const expectedState = buildMockQuerySuggest({
        completions: [],
        partialQueries: [],
        responseId: '',
      });

      const finalState = querySuggestReducer(state, clear({id}));
      expect(finalState[id]).toEqual(expectedState);
    });

    it('when the id is invalid, it does not throw', () => {
      const action = clear({id: 'invalid id'});
      expect(() => querySuggestReducer(state, action)).not.toThrow();
    });
  };

  describe('#clearQuerySuggest', () => {
    describeClear(clearQuerySuggest);
  });

  describe('#clearCommerceQuerySuggest', () => {
    describeClear(clearCommerceQuerySuggest);
  });

  const describePending = (
    fetch: typeof fetchQuerySuggestions | typeof fetchCommerceQuerySuggestions
  ) => {
    describe('#fetchQuerySuggestions.pending', () => {
      it('sets the currentRequestId to the the payload value', () => {
        const requestId = 'the_right_id';
        const action = fetch.pending(requestId, {id});
        const finalState = querySuggestReducer(state, action);

        expect(finalState[id]?.currentRequestId).toBe(requestId);
      });

      it('sets isLoading to true', () => {
        const action = fetch.pending('', {id});
        const finalState = querySuggestReducer(state, action);
        expect(finalState[id]?.isLoading).toBe(true);
      });

      it('when dispatching an id that is not registered, it does not throw', () => {
        const action = fetch.pending('', {id: 'invalid id'});
        expect(() => querySuggestReducer(state, action)).not.toThrow();
      });
    });
  };

  const describeRejected = (
    fetch: typeof fetchQuerySuggestions | typeof fetchCommerceQuerySuggestions
  ) => {
    describe('#fetchQuerySuggestions.rejected', () => {
      it('sets isLoading to false', () => {
        state[id]!.isLoading = true;

        const action = fetch.rejected(null, '', {id});
        const finalState = querySuggestReducer(state, action);
        expect(finalState[id]?.isLoading).toBe(false);
      });

      it('sets the error to the payload error', () => {
        const action = fetch.rejected(null, 'hello', {id});
        action.payload = buildMockSearchApiErrorWithStatusCode();

        const finalState = querySuggestReducer(state, action);
        expect(finalState[id]?.error).toEqual(action.payload);
      });

      it('when dispatching with an id that does not exist, does not throw', () => {
        const action = fetch.rejected(null, 'hello', {
          id: 'invalid id',
        });
        expect(() => querySuggestReducer(state, action)).not.toThrow();
      });
    });
  };

  describe('#fetchQuerySuggestions', () => {
    describePending(fetchQuerySuggestions);

    describe('#fetchQuerySuggestions.fulfilled', () => {
      const responseId = 'response-uuid';
      const completions = getCompletions();
      const fetchQuerySuggestionsFulfilledAction =
        buildFetchQuerySuggestFulfilledAction();

      fetchQuerySuggestionsFulfilledAction.meta.requestId = 'the_right_id';

      function buildFetchQuerySuggestFulfilledAction() {
        return fetchQuerySuggestions.fulfilled(
          {
            completions,
            id,
            responseId,
            q: 'abc',
          },
          '',
          {
            id,
          }
        );
      }

      it('when #fetchQuerySuggestions has an id that is not a key of the set, it does not throw', () => {
        const action = buildFetchQuerySuggestFulfilledAction();
        action.meta.arg.id = 'invalid id';

        expect(() => querySuggestReducer(state, action)).not.toThrow();
      });

      it(`when #fetchQuerySuggestions.fulfilled has the right request id
      should update the completions`, () => {
        state[id]!.currentRequestId = 'the_right_id';

        const finalState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        expect(finalState[id]?.completions).toEqual(completions);
      });

      it(`when #fetchQuerySuggestions.fulfilled has the right request id,
      it sets isLoading to false`, () => {
        state[id] = buildMockQuerySuggest({
          currentRequestId: 'the_right_id',
          isLoading: true,
        });

        const finalState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        expect(finalState[id]?.isLoading).toBe(false);
      });

      it(`when #fetchQuerySuggestions.fulfilled has the right request id,
      it sets the responseId`, () => {
        state[id]!.currentRequestId = 'the_right_id';

        const finalState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        expect(finalState[id]?.responseId).toBe(responseId);
      });

      it(`when #fetchQuerySuggestions.fulfilled has the right request id,
      it sets the error to null`, () => {
        state[id] = buildMockQuerySuggest({
          error: buildMockSearchApiErrorWithStatusCode(),
          currentRequestId: 'the_right_id',
        });

        const finalState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        expect(finalState[id]?.error).toBe(null);
      });

      it(`when #fetchQuerySuggestions.fulfilled has the wrong request id
      should not update the completions`, () => {
        state[id]!.currentRequestId = 'the_wrong_id';

        expect(
          querySuggestReducer(state, fetchQuerySuggestionsFulfilledAction)
        ).toMatchObject(state);
      });

      it('should add the executed query to the list of partialQueries', () => {
        state[id] = buildMockQuerySuggest({currentRequestId: 'the_right_id'});

        const nextState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        const {q} = fetchQuerySuggestionsFulfilledAction.payload;
        expect(nextState[id]?.partialQueries).toEqual([q]);
      });

      it('should encode `;` characters in the list of partialQueries', () => {
        fetchQuerySuggestionsFulfilledAction.payload.q = ';';

        state[id] = buildMockQuerySuggest({currentRequestId: 'the_right_id'});

        const nextState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        const {q} = fetchQuerySuggestionsFulfilledAction.payload;
        expect(nextState[id]?.partialQueries).toEqual([encodeURIComponent(q)]);
      });
    });

    describeRejected(fetchQuerySuggestions);
  });

  describe('#fetchCommerceQuerySuggestions', () => {
    describePending(fetchCommerceQuerySuggestions);

    describe('#fetchCommerceQuerySuggestions.fulfilled', () => {
      const responseId = 'response-uuid';
      const completions = getCompletions(0, 0);
      const fetchQuerySuggestionsFulfilledAction =
        buildFetchQuerySuggestFulfilledAction();

      fetchQuerySuggestionsFulfilledAction.meta.requestId = 'the_right_id';

      function buildFetchQuerySuggestFulfilledAction() {
        return fetchCommerceQuerySuggestions.fulfilled(
          {
            completions,
            id,
            responseId,
            query: 'abc',
            fieldSuggestionsFacets: [],
          },
          '',
          {
            id,
          }
        );
      }

      it('when #fetchQuerySuggestions has an id that is not a key of the set, it does not throw', () => {
        const action = buildFetchQuerySuggestFulfilledAction();
        action.meta.arg.id = 'invalid id';

        expect(() => querySuggestReducer(state, action)).not.toThrow();
      });

      it(`when #fetchQuerySuggestions.fulfilled has the right request id
      should update the completions`, () => {
        state[id]!.currentRequestId = 'the_right_id';

        const finalState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        expect(finalState[id]?.completions).toEqual(completions);
      });

      it(`when #fetchQuerySuggestions.fulfilled has the right request id,
      it sets isLoading to false`, () => {
        state[id] = buildMockQuerySuggest({
          currentRequestId: 'the_right_id',
          isLoading: true,
        });

        const finalState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        expect(finalState[id]?.isLoading).toBe(false);
      });

      it(`when #fetchQuerySuggestions.fulfilled has the right request id,
      it sets the responseId`, () => {
        state[id]!.currentRequestId = 'the_right_id';

        const finalState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        expect(finalState[id]?.responseId).toBe(responseId);
      });

      it(`when #fetchQuerySuggestions.fulfilled has the right request id,
      it sets the error to null`, () => {
        state[id] = buildMockQuerySuggest({
          error: buildMockSearchApiErrorWithStatusCode(),
          currentRequestId: 'the_right_id',
        });

        const finalState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        expect(finalState[id]?.error).toBe(null);
      });

      it(`when #fetchQuerySuggestions.fulfilled has the wrong request id
      should not update the completions`, () => {
        state[id]!.currentRequestId = 'the_wrong_id';

        expect(
          querySuggestReducer(state, fetchQuerySuggestionsFulfilledAction)
        ).toMatchObject(state);
      });

      it('should add the executed query to the list of partialQueries', () => {
        state[id] = buildMockQuerySuggest({currentRequestId: 'the_right_id'});

        const nextState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        const {query} = fetchQuerySuggestionsFulfilledAction.payload;
        expect(nextState[id]?.partialQueries).toEqual([query]);
      });

      it('should encode `;` characters in the list of partialQueries', () => {
        fetchQuerySuggestionsFulfilledAction.payload.query = ';';

        state[id] = buildMockQuerySuggest({currentRequestId: 'the_right_id'});

        const nextState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        const {query} = fetchQuerySuggestionsFulfilledAction.payload;
        expect(nextState[id]?.partialQueries).toEqual([
          encodeURIComponent(query),
        ]);
      });
    });

    describeRejected(fetchCommerceQuerySuggestions);
  });

  describe('#setError', () => {
    it('should set the error state and set isLoading to false', () => {
      const error = {
        message: 'Something went wrong',
        statusCode: 401,
        status: 401,
        type: 'BadRequest',
      };
      state[id]!.isLoading = true;

      const finalState = querySuggestReducer(state, setError(error));

      expect(finalState[id]?.error).toEqual(error);
      expect(finalState[id]?.isLoading).toBe(false);
    });
  });
});
