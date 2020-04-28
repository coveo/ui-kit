import {
  ResultsState,
  resultsReducer,
  getResultsInitialState,
} from './results-slice';
import {launchSearch} from '../search/search-slice';
import {getFakeResult, getFakeResults} from '../../utils/fake-results';

describe('results slice', () => {
  it('should have initial state', () => {
    expect(resultsReducer(undefined, {type: 'randomAction'})).toEqual(
      getResultsInitialState()
    );
  });

  it('should handle launchSearch.fulfilled on initial state', () => {
    const result = getFakeResult();
    const expectedState: ResultsState = {
      ...getResultsInitialState(),
      results: [result],
    };

    const action = launchSearch.fulfilled({results: [result]}, '');
    expect(resultsReducer(undefined, action)).toEqual(expectedState);
  });

  it('should handle launchSearch.fulfilled on existing state', () => {
    const existingResult = getFakeResult();
    const newResults = getFakeResults(3);

    const existingState: ResultsState = {
      ...getResultsInitialState(),
      results: [existingResult],
    };
    const expectedState: ResultsState = {
      ...getResultsInitialState(),
      results: newResults,
    };

    const action = launchSearch.fulfilled({results: newResults}, '');
    expect(resultsReducer(existingState, action)).toEqual(expectedState);
  });
});
