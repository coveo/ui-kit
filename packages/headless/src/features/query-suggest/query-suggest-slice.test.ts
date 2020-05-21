import {
  selectQuerySuggestion,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  updateQuerySuggestQuery,
  querySuggestReducer,
  getQuerySuggestInitialState,
  registerQuerySuggest,
  fetchQuerySuggestions,
} from './query-suggest-slice';
import {QuerySuggestState, QuerySuggestSet} from '../../state';
import {QuerySuggestCompletion} from '../../api/search/query-suggest/query-suggest-response';

describe('redirection slice', () => {
  const id = 'searchbox_1234';

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
    return {
      [id]: {
        ...getQuerySuggestInitialState(),
        id,
        ...querySuggest,
      },
    };
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

  it('should handle updateQuerySuggestQuery on existing state', () => {
    const expectedState = addToDefaultState({q: 'test'});
    const existingState = addToDefaultState({q: 'hello'});

    expect(
      querySuggestReducer(
        existingState,
        updateQuerySuggestQuery({id, q: 'test'})
      )
    ).toEqual(expectedState);
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
        {completions},
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
