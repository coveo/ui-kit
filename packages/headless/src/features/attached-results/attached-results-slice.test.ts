import {createMockAttachedResult} from '../../test/mock-attached-results.js';
import {
  attachResult,
  detachResult,
  setAttachedResults,
} from './attached-results-actions.js';
import {attachedResultsReducer} from './attached-results-slice.js';
import {
  AttachedResultsState,
  getAttachedResultsInitialState,
} from './attached-results-state.js';

describe('attached results slice', () => {
  let state: AttachedResultsState;

  beforeEach(() => {
    state = getAttachedResultsInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = attachedResultsReducer(undefined, {type: ''});
    expect(finalState).toEqual({
      results: [],
      loading: false,
    });
  });

  it('#setAttachedResults sets the state #results correctly', () => {
    const testPermanentId = 'testPermanentId';
    const testAttachedResult = createMockAttachedResult({
      permanentId: testPermanentId,
    });
    const action = setAttachedResults({
      results: [testAttachedResult],
    });
    const finalState = attachedResultsReducer(state, action);
    expect(finalState.results).toBe(action.payload.results);
    expect(finalState.results.length).toEqual(1);
    expect(finalState.results).toContainEqual(testAttachedResult);
  });

  it('#setAttachedResults accepts an empty array of results', () => {
    const action = setAttachedResults({
      results: [],
      loading: true,
    });
    const finalState = attachedResultsReducer(state, action);
    expect(finalState).toStrictEqual(action.payload);
    expect(finalState.results.length).toEqual(0);
  });

  it('#attachResult correctly adds a result in the attached state', () => {
    const testAttachedResult = createMockAttachedResult();
    const action = attachResult({
      result: testAttachedResult,
    });
    const finalState = attachedResultsReducer(state, action);
    expect(finalState.results.length).toEqual(1);
    expect(finalState.results).toStrictEqual([testAttachedResult]);
  });

  it('#attachResult correctly adds multiple results in the attached state', () => {
    const ids = ['foo', 'bar', 'baz'];
    const results = ids.map((id) =>
      createMockAttachedResult({
        permanentId: id,
      })
    );
    let finalState = attachedResultsReducer(state, {type: ''});
    results.forEach((result) => {
      const action = attachResult({
        result: result,
      });
      finalState = attachedResultsReducer(finalState, action);
    });

    expect(finalState.results.length).toEqual(results.length);
    expect(finalState.results).toStrictEqual([...results]);
  });

  it('#attachResult correctly attaches results so we can find them later', () => {
    const testPermanentId = 'testPermanentId';
    const testAttachedResult = createMockAttachedResult({
      permanentId: testPermanentId,
    });
    const action = attachResult({
      result: testAttachedResult,
    });
    const finalState = attachedResultsReducer(state, action);

    expect(finalState.results).toContainEqual(testAttachedResult);
  });

  it('#detachResult can be called when no results are attached without breaking', () => {
    const testDetachResult = createMockAttachedResult();
    const action = detachResult({
      result: testDetachResult,
    });

    const finalState = attachedResultsReducer(state, action);
    expect(finalState.results.length).toEqual(0);
  });

  it('#detachResult will detach an attached result', () => {
    const testPermanentId = 'testPermanentId';
    const testDetachResult = createMockAttachedResult({
      permanentId: testPermanentId,
    });

    const attachAction = attachResult({
      result: testDetachResult,
    });
    const intermediateState = attachedResultsReducer(state, attachAction);

    const detachAction = detachResult({
      result: testDetachResult,
    });
    const finalState = attachedResultsReducer(intermediateState, detachAction);

    expect(finalState.results.length).toEqual(0);
  });

  it('#detachResult will detach the correct result among multiple attached results', () => {
    const permanentIdToTest = 'foo';
    const ids = [permanentIdToTest, 'bar', 'baz'];
    const attachedResults = ids.map((id) =>
      createMockAttachedResult({
        permanentId: id,
      })
    );

    const setAttachedResultsAction = setAttachedResults({
      results: [...attachedResults],
    });
    const intermediateState = attachedResultsReducer(
      state,
      setAttachedResultsAction
    );

    const resultToDetach = createMockAttachedResult({
      permanentId: permanentIdToTest,
    });
    const detachAction = detachResult({
      result: resultToDetach,
    });
    const finalState = attachedResultsReducer(intermediateState, detachAction);

    const expectedAttachedResults = attachedResults.slice(1, 3);
    expect(finalState.results.length).toEqual(expectedAttachedResults.length);
    expect(finalState.results).toStrictEqual(expectedAttachedResults);
  });
});
