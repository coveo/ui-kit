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
import {QuerySuggestSet, QuerySuggestState} from './query-suggest-state';
import {buildMockSearchApiErrorWithStatusCode} from '../../test/mock-search-api-error-with-status-code';

describe('querySuggest slice', () => {
  let state: QuerySuggestSet;
  const id = 'searchBox_1234';

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

  function addToDefaultState(
    querySuggest: Partial<QuerySuggestState>
  ): QuerySuggestSet {
    const qs = buildMockQuerySuggest({id, ...querySuggest});
    return {[id]: qs};
  }

  beforeEach(() => {
    state = {
      [id]: buildMockQuerySuggest(),
    };
  });

  it('should have initial state', () => {
    expect(querySuggestReducer(undefined, {type: 'randomAction'})).toEqual({});
  });

  it('should handle registerQuerySuggest on initial state', () => {
    const expectedState = addToDefaultState({q: 'test', count: 10});
    expect(
      querySuggestReducer(
        undefined,
        registerQuerySuggest({id, q: 'test', count: 10})
      )
    ).toEqual(expectedState);
  });

  it('should handle selectQuerySuggestion on existing state', () => {
    const expectedState = addToDefaultState({
      completions: getCompletions(),
      q: 'some expression',
    });

    const existingState = addToDefaultState({
      completions: getCompletions(),
      q: 'some previous query',
    });

    expect(
      querySuggestReducer(
        existingState,
        selectQuerySuggestion({id, expression: 'some expression'})
      )
    ).toEqual(expectedState);
  });

  it('should handle clearQuerySuggest on existing state', () => {
    const expectedState = addToDefaultState({
      completions: [],
      q: '',
      partialQueries: [],
    });
    const existingState = addToDefaultState({
      completions: getCompletions(),
      q: 'some query',
      partialQueries: ['s', 'so', 'som', 'some'],
    });
    expect(querySuggestReducer(existingState, clearQuerySuggest({id}))).toEqual(
      expectedState
    );
  });

  it(`when a query in the querySet is updated,
  does not update the query suggest query if the id is missing`, () => {
    const unknownId = '1';
    const query = 'query';

    const action = updateQuerySetQuery({id: unknownId, query});
    const finalState = querySuggestReducer(addToDefaultState({}), action);

    expect(finalState[unknownId]).toBe(undefined);
  });

  it(`when a query in the querySet is updated,
  it updates the query suggest query if the id exists`, () => {
    const query = 'query';

    const action = updateQuerySetQuery({id, query});
    const finalState = querySuggestReducer(addToDefaultState({}), action);

    expect(finalState[id]?.q).toBe(query);
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
      const completions = getCompletions();
      const fetchQuerySuggestionsFulfilledAction = fetchQuerySuggestions.fulfilled(
        {completions, id},
        '',
        {id}
      );
      fetchQuerySuggestionsFulfilledAction.meta.requestId = 'the_right_id';

      it('when fetchQuerySuggestions has an invalid id, it does not throw', () => {
        const id = 'invalid id';
        const action = fetchQuerySuggestions.fulfilled({completions, id}, '', {
          id,
        });

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
