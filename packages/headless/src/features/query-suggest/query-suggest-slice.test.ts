import {
  querySuggestReducer,
  fetchQuerySuggestions,
  getQuerySuggestInitialState,
  updateQuerySuggestCount,
} from './query-suggest-slice';
import {QuerySuggestState} from '../../state';
import {QuerySuggestCompletion} from '../../api/search/query-suggest/query-suggest-response';
import {mockStore} from '../../utils/mock-store';

describe('redirection slice', () => {
  it('should have initial state', () => {
    expect(querySuggestReducer(undefined, {type: 'randomAction'})).toEqual(
      getQuerySuggestInitialState()
    );
  });

  describe('updateQuerySuggestCount', () => {
    const expectedState: QuerySuggestState = {
      ...getQuerySuggestInitialState(),
      count: 20,
    };

    it('should handle updateQuerySuggestCount on initial state', () => {
      expect(
        querySuggestReducer(undefined, updateQuerySuggestCount({count: 20}))
      ).toEqual(expectedState);
    });

    it('should handle updateQuerySuggestCount on existing state', () => {
      const existingState: QuerySuggestState = {
        ...getQuerySuggestInitialState(),
        count: 5,
      };

      expect(
        querySuggestReducer(existingState, updateQuerySuggestCount({count: 20}))
      ).toEqual(expectedState);
    });
  });

  it('fetchQuerySuggestions should dispatch updateQuerySuggestCount', () => {
    const store = mockStore();
    store.dispatch(fetchQuerySuggestions({count: 20}));
    expect(store.getActions()[1]).toEqual(updateQuerySuggestCount({count: 20}));
  });

  describe('fetchQuerySuggestions.fulfilled', () => {
    const completion: QuerySuggestCompletion = {
      expression: 'test completion',
      executableConfidence: 1,
      highlighted: 'test completion',
      score: 999,
    };
    const fetchQuerySuggestionsFulfilledAction = fetchQuerySuggestions.fulfilled(
      {completions: [completion]},
      '',
      {
        count: 10,
      }
    );
    const expectedState: QuerySuggestState = {
      ...getQuerySuggestInitialState(),
      completions: [completion],
    };

    it('should handle fetchQuerySuggestions.fulfilled on initial state', () => {
      expect(
        querySuggestReducer(undefined, fetchQuerySuggestionsFulfilledAction)
      ).toMatchObject(expectedState);
    });

    it('should handle fetchQuerySuggestions.fulfilled on an existing state', () => {
      const anotherCompletion = {...completion};
      anotherCompletion.expression = 'not a test';
      const existingState: QuerySuggestState = {
        ...getQuerySuggestInitialState(),
        completions: [anotherCompletion],
      };

      expect(
        querySuggestReducer(existingState, fetchQuerySuggestionsFulfilledAction)
      ).toMatchObject(expectedState);
    });
  });
});
