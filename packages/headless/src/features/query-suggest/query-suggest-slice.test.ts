import {
  registerQuerySuggest,
  selectQuerySuggestion,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  updateQuerySuggestQuery,
  querySuggestReducer,
  getQuerySuggestInitialState,
  fetchQuerySuggestions,
} from './query-suggest-slice';
import {QuerySuggestState} from '../../state';
import {QuerySuggestCompletion} from '../../api/search/query-suggest/query-suggest-response';

describe('redirection slice', () => {
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

  it('should have initial state', () => {
    expect(querySuggestReducer(undefined, {type: 'randomAction'})).toEqual(
      getQuerySuggestInitialState()
    );
  });

  describe('registerQuerySuggest', () => {
    const expectedState: QuerySuggestState = {
      ...getQuerySuggestInitialState(),
      q: 'test',
      count: 10,
    };

    it('should handle registerQuerySuggest on initial state', () => {
      expect(
        querySuggestReducer(
          undefined,
          registerQuerySuggest({q: 'test', count: 10})
        )
      ).toEqual(expectedState);
    });

    it('should handle registerQuerySuggest on existing state', () => {
      const existingState: QuerySuggestState = {
        ...getQuerySuggestInitialState(),
        q: 'hello',
      };

      expect(
        querySuggestReducer(
          existingState,
          registerQuerySuggest({q: 'test', count: 10})
        )
      ).toEqual(expectedState);
    });
  });

  describe('selectQuerySuggestion', () => {
    const expectedState: QuerySuggestState = {
      ...getQuerySuggestInitialState(),
      completions: [],
      q: 'some expression',
    };

    it('should handle selectQuerySuggestion on initial state', () => {
      expect(
        querySuggestReducer(
          undefined,
          selectQuerySuggestion({expression: 'some expression'})
        )
      ).toEqual(expectedState);
    });

    it('should handle selectQuerySuggestion on existing state', () => {
      const existingState: QuerySuggestState = {
        ...getQuerySuggestInitialState(),
        completions: getCompletions(),
        q: 'some previous query',
      };

      expect(
        querySuggestReducer(
          existingState,
          selectQuerySuggestion({expression: 'some expression'})
        )
      ).toEqual(expectedState);
    });
  });

  describe('clearQuerySuggest', () => {
    const expectedState: QuerySuggestState = {
      ...getQuerySuggestInitialState(),
      completions: [],
      q: '',
    };

    it('should handle clearQuerySuggest on initial state', () => {
      expect(querySuggestReducer(undefined, clearQuerySuggest())).toEqual(
        expectedState
      );
    });

    it('should handle clearQuerySuggest on existing state', () => {
      const existingState: QuerySuggestState = {
        ...getQuerySuggestInitialState(),
        completions: getCompletions(),
        q: 'some query',
      };

      expect(querySuggestReducer(existingState, clearQuerySuggest())).toEqual(
        expectedState
      );
    });
  });

  describe('clearQuerySuggestCompletions', () => {
    const expectedState: QuerySuggestState = {
      ...getQuerySuggestInitialState(),
      completions: [],
    };

    it('should handle clearQuerySuggestCompletions on initial state', () => {
      expect(
        querySuggestReducer(undefined, clearQuerySuggestCompletions())
      ).toEqual(expectedState);
    });

    it('should handle clearQuerySuggestCompletions on existing state', () => {
      const existingState: QuerySuggestState = {
        ...getQuerySuggestInitialState(),
        completions: getCompletions(),
      };

      expect(
        querySuggestReducer(existingState, clearQuerySuggestCompletions())
      ).toEqual(expectedState);
    });
  });

  describe('updateQuerySuggestQuery', () => {
    const expectedState: QuerySuggestState = {
      ...getQuerySuggestInitialState(),
      q: 'test',
    };

    it('should handle updateQuerySuggestQuery on initial state', () => {
      expect(
        querySuggestReducer(undefined, updateQuerySuggestQuery({q: 'test'}))
      ).toEqual(expectedState);
    });

    it('should handle updateQuerySuggestQuery on existing state', () => {
      const existingState: QuerySuggestState = {
        ...getQuerySuggestInitialState(),
        q: 'hello',
      };

      expect(
        querySuggestReducer(existingState, updateQuerySuggestQuery({q: 'test'}))
      ).toEqual(expectedState);
    });
  });

  describe('fetchQuerySuggestions', () => {
    describe('fetchQuerySuggestions.pending', () => {
      const expectedState: QuerySuggestState = {
        ...getQuerySuggestInitialState(),
        currentRequestId: 'the_right_id',
      };

      const fetchQuerySuggestionsPendingAction = fetchQuerySuggestions.pending(
        'the_right_id'
      );

      it('should handle fetchQuerySuggestions.pending on initial state', () => {
        expect(
          querySuggestReducer(undefined, fetchQuerySuggestionsPendingAction)
        ).toEqual(expectedState);
      });

      it('should handle fetchQuerySuggestions.pending on existing state', () => {
        const existingState: QuerySuggestState = {
          ...getQuerySuggestInitialState(),
          currentRequestId: 'the_wrong_id',
        };

        expect(
          querySuggestReducer(existingState, fetchQuerySuggestionsPendingAction)
        ).toEqual(expectedState);
      });
    });
    describe('fetchQuerySuggestions.fulfilled', () => {
      const completions = getCompletions();
      const fetchQuerySuggestionsFulfilledAction = fetchQuerySuggestions.fulfilled(
        {completions},
        ''
      );
      fetchQuerySuggestionsFulfilledAction.meta.requestId = 'the_right_id';

      it(`when fetchQuerySuggestions.fulfilled has the right request id
      should update the completions`, () => {
        const expectedState: QuerySuggestState = {
          ...getQuerySuggestInitialState(),
          currentRequestId: 'the_right_id',
          completions,
        };

        const existingState: QuerySuggestState = {
          ...getQuerySuggestInitialState(),
          currentRequestId: 'the_right_id',
        };
        expect(
          querySuggestReducer(
            existingState,
            fetchQuerySuggestionsFulfilledAction
          )
        ).toMatchObject(expectedState);
      });

      it(`when fetchQuerySuggestions.fulfilled has the wrong request id
      should not update the completions`, () => {
        const existingState: QuerySuggestState = {
          ...getQuerySuggestInitialState(),
          currentRequestId: 'the_wrong_id',
        };

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
