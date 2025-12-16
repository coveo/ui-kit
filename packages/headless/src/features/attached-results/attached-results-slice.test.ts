import {createMockAttachedResult} from '../../test/mock-attached-results.js';
import {buildMockCitation} from '../../test/mock-citation.js';
import {
  attachCitation,
  detachCitation,
} from './attached-citations/attached-citations-actions.js';
import {
  attachResult,
  detachResult,
  setAttachedResults,
} from './attached-results-actions.js';
import {attachedResultsReducer} from './attached-results-slice.js';
import {
  type AttachedResultsState,
  getAttachedResultsInitialState,
} from './attached-results-state.js';

describe('attached results slice', () => {
  let state: AttachedResultsState;

  beforeEach(() => {
    state = getAttachedResultsInitialState();
  });

  const createTestCitation = (permanentid: string, title?: string) =>
    buildMockCitation({
      permanentid,
      title: title || `Citation ${permanentid}`,
      clickUri: `https://example.com/${permanentid}`,
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
    expect(finalState.results).toHaveLength(1);
    expect(finalState.results).toContainEqual(testAttachedResult);
  });

  it('#setAttachedResults accepts an empty array of results', () => {
    const action = setAttachedResults({
      results: [],
      loading: true,
    });
    const finalState = attachedResultsReducer(state, action);
    expect(finalState).toStrictEqual(action.payload);
    expect(finalState.results).toHaveLength(0);
    expect(finalState.loading).toBe(true);
  });

  it('#attachResult correctly adds a result in the attached state', () => {
    const testAttachedResult = createMockAttachedResult();
    const action = attachResult(testAttachedResult);
    const finalState = attachedResultsReducer(state, action);
    expect(finalState.results).toHaveLength(1);
    expect(finalState.results).toStrictEqual([testAttachedResult]);
  });

  it('#attachResult correctly adds multiple results in the attached state', () => {
    const ids = ['foo', 'bar', 'baz'];
    const attachedResults = ids.map((id) =>
      createMockAttachedResult({
        permanentId: id,
      })
    );
    let finalState = attachedResultsReducer(state, {type: ''});
    attachedResults.forEach((attachedResult) => {
      const action = attachResult(attachedResult);
      finalState = attachedResultsReducer(finalState, action);
    });

    expect(finalState.results).toHaveLength(attachedResults.length);
    expect(finalState.results).toStrictEqual([...attachedResults]);
  });

  it('#attachResult correctly attaches results so we can find them later', () => {
    const testPermanentId = 'testPermanentId';
    const testAttachedResult = createMockAttachedResult({
      permanentId: testPermanentId,
    });
    const action = attachResult(testAttachedResult);
    const finalState = attachedResultsReducer(state, action);

    expect(finalState.results).toContainEqual(testAttachedResult);
  });

  it('#detachResult can be called when no results are attached without breaking', () => {
    const testDetachResult = createMockAttachedResult();
    const action = detachResult(testDetachResult);

    const finalState = attachedResultsReducer(state, action);
    expect(finalState.results).toHaveLength(0);
  });

  it('#detachResult will detach an attached result', () => {
    const testPermanentId = 'testPermanentId';
    const testDetachResult = createMockAttachedResult({
      permanentId: testPermanentId,
    });

    const attachAction = attachResult(testDetachResult);
    const intermediateState = attachedResultsReducer(state, attachAction);

    const detachAction = detachResult(testDetachResult);
    const finalState = attachedResultsReducer(intermediateState, detachAction);

    expect(finalState.results).toHaveLength(0);
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
    const detachAction = detachResult(resultToDetach);
    const finalState = attachedResultsReducer(intermediateState, detachAction);

    const expectedAttachedResults = attachedResults.slice(1, 3);
    expect(finalState.results.length).toEqual(expectedAttachedResults.length);
    expect(finalState.results).toStrictEqual(expectedAttachedResults);
  });

  describe('citation actions', () => {
    it('attachCitation correctly adds a citation in the attached state', () => {
      const testCitation = createTestCitation(
        'test-citation-id',
        'Test Citation'
      );
      const testCaseId = 'test-case-id';
      const action = attachCitation({
        citation: testCitation,
        caseId: testCaseId,
      });
      const finalState = attachedResultsReducer(state, action);

      expect(finalState.results).toHaveLength(1);
      expect(finalState.results[0]).toEqual(
        expect.objectContaining({
          caseId: testCaseId,
          permanentId: testCitation.permanentid,
          title: testCitation.title,
          isCitation: true,
        })
      );
    });

    it('attachCitation correctly adds multiple citations in the attached state', () => {
      const ids = ['citation-foo', 'citation-bar', 'citation-baz'];
      const citations = ids.map((id) => createTestCitation(id));
      const testCaseId = 'test-case-id';

      let finalState = attachedResultsReducer(state, {type: ''});
      citations.forEach((citation) => {
        const action = attachCitation({citation, caseId: testCaseId});
        finalState = attachedResultsReducer(finalState, action);
      });

      expect(finalState.results).toHaveLength(citations.length);
      expect(
        finalState.results.every((result) => result.isCitation === true)
      ).toBe(true);
      expect(finalState.results.map((r) => r.permanentId)).toEqual(ids);
    });

    it('attachCitation correctly attaches citations so we can find them later', () => {
      const testPermanentId = 'testCitationId';
      const testCitation = createTestCitation(testPermanentId, 'Test Citation');
      const testCaseId = 'test-case-id';
      const action = attachCitation({
        citation: testCitation,
        caseId: testCaseId,
      });
      const finalState = attachedResultsReducer(state, action);

      expect(finalState.results).toContainEqual(
        expect.objectContaining({
          permanentId: testPermanentId,
          isCitation: true,
        })
      );
    });

    it('detachCitation can be called when no citations are attached without breaking', () => {
      const nonExistentCitation = createMockAttachedResult({
        permanentId: 'non-existent-citation',
        caseId: 'test-case-id',
      });
      const action = detachCitation(nonExistentCitation);

      const finalState = attachedResultsReducer(state, action);
      expect(finalState.results).toHaveLength(0);
    });

    it('detachCitation will detach an attached citation', () => {
      const testPermanentId = 'testCitationId';
      const testCitation = createTestCitation(
        testPermanentId,
        'Citation to Detach'
      );
      const testCaseId = 'test-case-id';

      const attachAction = attachCitation({
        citation: testCitation,
        caseId: testCaseId,
      });
      const intermediateState = attachedResultsReducer(state, attachAction);

      const citationToDetach = createMockAttachedResult({
        permanentId: testPermanentId,
        caseId: testCaseId,
      });
      const detachAction = detachCitation(citationToDetach);
      const finalState = attachedResultsReducer(
        intermediateState,
        detachAction
      );

      expect(finalState.results).toHaveLength(0);
    });

    it('detachCitation will detach the correct citation among multiple attached citations', () => {
      const permanentIdToTest = 'citation-foo';
      const ids = [permanentIdToTest, 'citation-bar', 'citation-baz'];
      const citations = ids.map((id) => createTestCitation(id));
      const testCaseId = 'test-case-id';

      let intermediateState = state;
      citations.forEach((citation) => {
        const action = attachCitation({citation, caseId: testCaseId});
        intermediateState = attachedResultsReducer(intermediateState, action);
      });

      const citationToDetach = createMockAttachedResult({
        permanentId: permanentIdToTest,
        caseId: testCaseId,
      });
      const detachAction = detachCitation(citationToDetach);
      const finalState = attachedResultsReducer(
        intermediateState,
        detachAction
      );

      const expectedIds = ids.slice(1, 3); // Remove first item
      expect(finalState.results).toHaveLength(expectedIds.length);
      expect(finalState.results.map((r) => r.permanentId)).toEqual(expectedIds);
    });
  });
});
