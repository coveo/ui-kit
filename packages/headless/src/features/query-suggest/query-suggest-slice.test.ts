import {
  querySuggestReducer,
  QuerySuggestSet,
  QuerySuggestState,
} from './query-suggest-slice';
import {QuerySuggestCompletion} from '../../api/search/query-suggest/query-suggest-response';
import {
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  fetchQuerySuggestions,
  registerQuerySuggest,
  selectQuerySuggestion,
} from './query-suggest-actions';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest';
import {updateQuerySetQuery} from '../query-set/query-set-actions';

describe('querySuggest slice', () => {
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
      completions: [],
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
    const expectedState = addToDefaultState({completions: [], q: ''});
    const existingState = addToDefaultState({
      completions: getCompletions(),
      q: 'some query',
    });
    expect(querySuggestReducer(existingState, clearQuerySuggest({id}))).toEqual(
      expectedState
    );
  });

  it('should handle clearQuerySuggestCompletions on existing state', () => {
    const expectedState = addToDefaultState({completions: []});
    const existingState = addToDefaultState({completions: getCompletions()});

    expect(
      querySuggestReducer(existingState, clearQuerySuggestCompletions({id}))
    ).toEqual(expectedState);
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
      const expectedState = addToDefaultState({
        currentRequestId: 'the_right_id',
      });

      const fetchQuerySuggestionsPendingAction = fetchQuerySuggestions.pending(
        'the_right_id',
        {id}
      );

      it('should handle fetchQuerySuggestions.pending on existing state', () => {
        const existingState = addToDefaultState({
          currentRequestId: 'the_wrong_id',
        });

        expect(
          querySuggestReducer(existingState, fetchQuerySuggestionsPendingAction)
        ).toEqual(expectedState);
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

      it(`when fetchQuerySuggestions.fulfilled has the right request id
      should update the completions`, () => {
        const expectedState = addToDefaultState({
          currentRequestId: 'the_right_id',
          completions,
        });

        const existingState = addToDefaultState({
          currentRequestId: 'the_right_id',
        });
        expect(
          querySuggestReducer(
            existingState,
            fetchQuerySuggestionsFulfilledAction
          )
        ).toMatchObject(expectedState);
      });

      it(`when fetchQuerySuggestions.fulfilled has the wrong request id
      should not update the completions`, () => {
        const existingState = addToDefaultState({
          currentRequestId: 'the_wrong_id',
        });

        expect(
          querySuggestReducer(
            existingState,
            fetchQuerySuggestionsFulfilledAction
          )
        ).toMatchObject(existingState);
      });
    });
  });
});
