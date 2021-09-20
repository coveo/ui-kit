import {querySuggestReducer} from './query-suggest-slice';
import {QuerySuggestCompletion} from '../../api/search/query-suggest/query-suggest-response';
import {
  clearQuerySuggest,
  fetchQuerySuggestions,
  registerQuerySuggest,
  selectQuerySuggestion,
} from './query-suggest-actions';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest';
import {updateQuerySetQuery} from '../query-set/query-set-actions';
import {QuerySuggestSet} from './query-suggest-state';
import {buildMockSearchApiErrorWithStatusCode} from '../../test/mock-search-api-error-with-status-code';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';
import {buildMockQuerySuggestCompletion} from '../../test/mock-query-suggest-completion';
import {executeSearch} from '../search/search-actions';
import {buildMockSearch} from '../../test/mock-search';
import {logSearchboxSubmit} from '../query/query-analytics-actions';

describe('querySuggest slice', () => {
  let state: QuerySuggestSet;
  const id = 'searchBox_1234';
  const anotherId = 'searchBox_6789';

  function getCompletions() {
    const completions: QuerySuggestCompletion[] = [];
    for (let index = 0; index < 5; index++) {
      completions.push({
        expression: 'test completion',
        executableConfidence: 1,
        highlighted: 'test completion',
        score: 999,
      });
    }

    return completions;
  }

  beforeEach(() => {
    state = {
      [id]: buildMockQuerySuggest(),
      [anotherId]: buildMockQuerySuggest({
        q: 'nice',
        completions: [buildMockQuerySuggestCompletion()],
        partialQueries: ['n', 'i', 'c'],
      }),
    };
  });

  it('should have initial state', () => {
    expect(querySuggestReducer(undefined, {type: 'randomAction'})).toEqual({});
  });

  describe('registerQuerySuggest', () => {
    it('when the id does not exist, it adds an entry with the correct state', () => {
      const expectedState = buildMockQuerySuggest({id, q: 'test', count: 10});
      const action = registerQuerySuggest({id, q: 'test', count: 10});
      const finalState = querySuggestReducer(undefined, action);

      expect(finalState[id]).toEqual(expectedState);
    });

    it('when the id exists, it does not modify the registered state', () => {
      const action = registerQuerySuggest({id, q: 'test', count: 10});
      const finalState = querySuggestReducer(state, action);

      expect(state[id]).toEqual(finalState[id]);
    });
  });

  describe('selectQuerySuggestion', () => {
    it('when the id is valid, it updates the query to the passed expression', () => {
      state[id]!.q = 'some previous query';
      const action = selectQuerySuggestion({id, expression: 'some expression'});
      const finalState = querySuggestReducer(state, action);

      expect(finalState[id]?.q).toBe('some expression');
    });

    it('when the id is invalid, it does not throw', () => {
      const action = selectQuerySuggestion({id: 'invalid id', expression: ''});
      expect(() => querySuggestReducer(state, action)).not.toThrow();
    });
  });

  describe('clearQuerySuggest', () => {
    it('when the id is valid, it clears completions, responseId and partialQueries, but not the query', () => {
      state[id] = buildMockQuerySuggest({
        completions: getCompletions(),
        q: 'some query',
        partialQueries: ['s', 'so', 'som', 'some'],
        responseId: 'response-uuid',
      });

      const expectedState = buildMockQuerySuggest({
        completions: [],
        q: 'some query',
        partialQueries: [],
        responseId: '',
      });

      const finalState = querySuggestReducer(state, clearQuerySuggest({id}));
      expect(finalState[id]).toEqual(expectedState);
    });

    it('when the id is invalid, it does not throw', () => {
      const action = clearQuerySuggest({id: 'invalid id'});
      expect(() => querySuggestReducer(state, action)).not.toThrow();
    });
  });

  describe('updateQuerySetQuery', () => {
    it(`when a query in the querySet is updated,
    does not update the query suggest query if the id is missing`, () => {
      const unknownId = '1';
      const action = updateQuerySetQuery({id: unknownId, query: 'query'});
      const finalState = querySuggestReducer(state, action);

      expect(finalState[unknownId]).toBe(undefined);
    });

    it(`when a query in the querySet is updated,
    it updates the query suggest query if the id exists`, () => {
      const query = 'query';
      const action = updateQuerySetQuery({id: anotherId, query});
      const finalState = querySuggestReducer(state, action);

      expect(finalState[anotherId]?.q).toBe(query);
    });
  });

  describe('restoreSearchParameters', () => {
    it('updates the query correctly when "q" is defined', () => {
      const query = 'query';
      const action = restoreSearchParameters({q: query});
      const finalState = querySuggestReducer(state, action);

      expect(finalState[id]?.q).toEqual(query);
      expect(finalState[anotherId]?.q).toEqual(query);
    });

    it('does not update the state when "q" is not defined', () => {
      const action = restoreSearchParameters({});
      const finalState = querySuggestReducer(state, action);

      expect(finalState[id]).toEqual(state[id]);
      expect(finalState[anotherId]).toEqual(state[anotherId]);
    });
  });

  it('updates the query correctly on executeSearch.fulfilled', () => {
    const query = 'query';
    const searchState = buildMockSearch({queryExecuted: query});
    const action = executeSearch.fulfilled(
      searchState,
      '',
      logSearchboxSubmit()
    );
    const finalState = querySuggestReducer(state, action);
    expect(finalState[id]?.q).toEqual(query);
    expect(finalState[anotherId]?.q).toEqual(query);
  });

  describe('fetchQuerySuggestions', () => {
    describe('fetchQuerySuggestions.pending', () => {
      it('sets the currentRequestId to the the payload value', () => {
        const requestId = 'the_right_id';
        const action = fetchQuerySuggestions.pending(requestId, {id});
        const finalState = querySuggestReducer(state, action);

        expect(finalState[id]?.currentRequestId).toBe(requestId);
      });

      it('sets isLoading to true', () => {
        const action = fetchQuerySuggestions.pending('', {id});
        const finalState = querySuggestReducer(state, action);
        expect(finalState[id]?.isLoading).toBe(true);
      });

      it('when dispatching an id that is not registered, it does not throw', () => {
        const action = fetchQuerySuggestions.pending('', {id: 'invalid id'});
        expect(() => querySuggestReducer(state, action)).not.toThrow();
      });
    });
    describe('fetchQuerySuggestions.fulfilled', () => {
      const responseId = 'response-uuid';
      const completions = getCompletions();
      const fetchQuerySuggestionsFulfilledAction =
        fetchQuerySuggestions.fulfilled({completions, id, responseId}, '', {
          id,
        });
      fetchQuerySuggestionsFulfilledAction.meta.requestId = 'the_right_id';

      it('when fetchQuerySuggestions has an invalid id, it does not throw', () => {
        const id = 'invalid id';
        const action = fetchQuerySuggestions.fulfilled(
          {completions, id, responseId},
          '',
          {
            id,
          }
        );

        expect(() => querySuggestReducer(state, action)).not.toThrow();
      });

      it(`when fetchQuerySuggestions.fulfilled has the right request id
      should update the completions`, () => {
        state[id]!.currentRequestId = 'the_right_id';

        const finalState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        expect(finalState[id]?.completions).toEqual(completions);
      });

      it(`when fetchQuerySuggestions.fulfilled has the right request id,
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

      it(`when fetchQuerySuggestions.fulfilled has the right request id,
      it sets the responseId`, () => {
        state[id]!.currentRequestId = 'the_right_id';

        const finalState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );

        expect(finalState[id]?.responseId).toBe(responseId);
      });

      it(`when fetchQuerySuggestions.fulfilled has the right request id,
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

      it(`when fetchQuerySuggestions.fulfilled has the wrong request id
      should not update the completions`, () => {
        state[id]!.currentRequestId = 'the_wrong_id';

        expect(
          querySuggestReducer(state, fetchQuerySuggestionsFulfilledAction)
        ).toMatchObject(state);
      });

      it('should add the executed query to the list of partialQueries', () => {
        const q = 'test';
        state[id] = buildMockQuerySuggest({
          q,
          currentRequestId: 'the_right_id',
        });

        const nextState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );
        expect(nextState[id]?.partialQueries).toEqual([q]);
      });

      it('should encode `;` characters in the list of partialQueries', () => {
        const q = ';';
        state[id] = buildMockQuerySuggest({
          q,
          currentRequestId: 'the_right_id',
        });

        const nextState = querySuggestReducer(
          state,
          fetchQuerySuggestionsFulfilledAction
        );
        expect(nextState[id]?.partialQueries).toEqual([encodeURIComponent(q)]);
      });
    });
    describe('fetchQuerySuggestions.rejected', () => {
      it('sets isLoading to false', () => {
        state[id]!.isLoading = true;

        const action = fetchQuerySuggestions.rejected(null, '', {id});
        const finalState = querySuggestReducer(state, action);
        expect(finalState[id]?.isLoading).toBe(false);
      });

      it('sets the error to the payload error', () => {
        const action = fetchQuerySuggestions.rejected(null, 'hello', {id});
        action.payload = buildMockSearchApiErrorWithStatusCode();

        const finalState = querySuggestReducer(state, action);
        expect(finalState[id]?.error).toEqual(action.payload);
      });

      it('when dispatching an id that does not exist, it does not throw', () => {
        const action = fetchQuerySuggestions.rejected(null, 'hello', {
          id: 'invalid id',
        });
        expect(() => querySuggestReducer(state, action)).not.toThrow();
      });
    });
  });
});
