import {configuration} from '../../../app/common-reducers.js';
import {
  attachResult,
  detachResult,
} from '../../../features/attached-results/attached-results-actions.js';
import {
  logCaseAttach,
  logCaseDetach,
} from '../../../features/attached-results/attached-results-analytics-actions.js';
import {attachedResultsReducer as attachedResults} from '../../../features/attached-results/attached-results-slice.js';
import {buildAttachedResultFromSearchResult} from '../../../features/attached-results/attached-results-utils.js';
import {createMockAttachedResult} from '../../../test/mock-attached-results.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {buildMockResult} from '../../../test/mock-result.js';
import {
  type AttachedResults,
  type AttachedResultsProps,
  buildAttachedResults,
} from './headless-attached-results.js';

vi.mock(
  '../../../features/attached-results/attached-results-analytics-actions',
  () => ({
    logCaseAttach: vi.fn(() => () => {}),
    logCaseDetach: vi.fn(() => () => {}),
  })
);

vi.mock('../../../features/attached-results/attached-results-actions');

describe('AttachedResults controller', () => {
  let engine: MockedInsightEngine;
  let controller: AttachedResults;
  let props: AttachedResultsProps;

  const recordId = 'test-record-123';
  const otherRecordId = 'other-record-456';

  const mockResult1 = buildMockResult({
    title: 'Test Result 1',
    clickUri: 'https://example.com/1',
    raw: {
      permanentid: 'perm-id-1',
      urihash: 'uri-hash-1',
      source: 'Test Source',
    },
  });

  const mockResult2 = buildMockResult({
    title: 'Test Result 2',
    clickUri: 'https://example.com/2',
    raw: {
      permanentid: 'perm-id-2',
      urihash: 'uri-hash-2',
      source: 'Test Source',
    },
  });

  function initController(options = {recordId}) {
    const mockState = buildMockInsightState();
    engine = buildMockInsightEngine(mockState);
    props = {options};
    controller = buildAttachedResults(engine, props);
  }

  beforeEach(() => {
    initController();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should add the correct reducers to the engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({
        configuration,
        attachedResults,
      });
    });

    it('should expose a subscribe method', () => {
      expect(controller.subscribe).toBeTruthy();
    });
  });

  describe('state', () => {
    it('should return empty array when no results are attached', () => {
      expect(controller.state).toEqual([]);
    });

    it('should return only results attached to the current record', () => {
      const mockAttachedResult1 = createMockAttachedResult({
        caseId: recordId,
        permanentId: 'perm-id-1',
      });
      const mockAttachedResult2 = createMockAttachedResult({
        caseId: recordId,
        permanentId: 'perm-id-2',
      });
      const mockAttachedResultOtherRecord = createMockAttachedResult({
        caseId: otherRecordId,
        permanentId: 'perm-id-3',
      });

      engine.state.attachedResults!.results.push(
        mockAttachedResult1,
        mockAttachedResult2,
        mockAttachedResultOtherRecord
      );

      expect(controller.state).toEqual([
        mockAttachedResult1,
        mockAttachedResult2,
      ]);
      expect(controller.state).not.toContain(mockAttachedResultOtherRecord);
    });

    it('should filter out results from other records', () => {
      const mockAttachedResultOtherRecord = createMockAttachedResult({
        caseId: otherRecordId,
        permanentId: 'perm-id-3',
      });

      engine.state.attachedResults!.results.push(mockAttachedResultOtherRecord);

      expect(controller.state).toEqual([]);
    });
  });

  describe('isAttached', () => {
    beforeEach(() => {
      const mockAttachedResult1 = createMockAttachedResult({
        caseId: recordId,
        permanentId: 'perm-id-1',
        uriHash: 'uri-hash-1',
      });
      engine.state.attachedResults!.results.push(mockAttachedResult1);
    });

    it('should return true when result is attached to the current record', () => {
      expect(controller.isAttached(mockResult1)).toBe(true);
    });

    it('should return false when result is not attached', () => {
      expect(controller.isAttached(mockResult2)).toBe(false);
    });

    it('should return false when recordId is null or undefined', () => {
      const controllerWithoutRecordId = buildAttachedResults(engine, {
        options: {recordId: ''},
      });
      expect(controllerWithoutRecordId.isAttached(mockResult1)).toBe(false);
    });

    it('should return false when result has no permanentid or urihash', () => {
      const resultWithoutIdentifiers = buildMockResult({
        raw: {
          permanentid: '',
          urihash: '',
          source: 'test',
        },
      });
      expect(controller.isAttached(resultWithoutIdentifiers)).toBe(false);
    });

    it('should match by permanentId when urihash is missing', () => {
      const resultWithOnlyPermanentId = buildMockResult({
        raw: {
          permanentid: 'perm-id-1',
          urihash: '',
          source: 'test',
        },
      });
      expect(controller.isAttached(resultWithOnlyPermanentId)).toBe(true);
    });

    it('should match by uriHash when permanentId is missing', () => {
      // Clear existing results and add one with only uriHash
      engine.state.attachedResults!.results = [];
      const attachedResultWithOnlyUriHash = createMockAttachedResult({
        caseId: recordId,
        permanentId: undefined,
        uriHash: 'uri-hash-1',
      });
      engine.state.attachedResults!.results.push(attachedResultWithOnlyUriHash);

      const resultWithOnlyUriHash = buildMockResult({
        raw: {
          permanentid: '',
          urihash: 'uri-hash-1',
          source: 'test',
        },
      });
      expect(controller.isAttached(resultWithOnlyUriHash)).toBe(true);
    });
  });

  describe('attach', () => {
    it('should dispatch attachResult action with correct payload', () => {
      controller.attach(mockResult1);

      expect(attachResult).toHaveBeenCalledWith(
        expect.objectContaining({
          caseId: recordId,
          permanentId: 'perm-id-1',
          uriHash: 'uri-hash-1',
          title: 'Test Result 1',
          resultUrl: 'https://example.com/1',
        })
      );
    });

    it('should dispatch logCaseAttach analytics action', () => {
      controller.attach(mockResult1);

      expect(logCaseAttach).toHaveBeenCalledWith(mockResult1);
    });

    it('should handle results with minimal data', () => {
      const minimalResult = buildMockResult({
        title: 'Minimal Result',
        clickUri: 'https://example.com/minimal',
        raw: {
          permanentid: undefined,
          urihash: undefined,
          source: 'test',
        },
      });

      controller.attach(minimalResult);

      expect(attachResult).toHaveBeenCalledWith(
        expect.objectContaining({
          caseId: recordId,
          title: 'Minimal Result',
          resultUrl: 'https://example.com/minimal',
        })
      );
    });
  });

  describe('detach', () => {
    it('should dispatch detachResult action with correct payload', () => {
      controller.detach(mockResult1);

      expect(detachResult).toHaveBeenCalledWith(
        expect.objectContaining({
          caseId: recordId,
          permanentId: 'perm-id-1',
          uriHash: 'uri-hash-1',
          title: 'Test Result 1',
          resultUrl: 'https://example.com/1',
        })
      );
    });

    it('should dispatch logCaseDetach analytics action', () => {
      controller.detach(mockResult1);

      expect(detachResult).toHaveBeenCalledWith(
        buildAttachedResultFromSearchResult(mockResult1, recordId)
      );
      expect(logCaseDetach).toHaveBeenCalledWith(mockResult1);
    });
  });

  describe('integration scenarios', () => {
    it('should handle attach and detach operations for the same record', () => {
      // Initially no results attached
      expect(controller.state).toEqual([]);
      expect(controller.isAttached(mockResult1)).toBe(false);

      // Simulate attaching a result (update engine state manually for test)
      const mockAttachedResult1 = createMockAttachedResult({
        caseId: recordId,
        permanentId: 'perm-id-1',
        uriHash: 'uri-hash-1',
      });
      engine.state.attachedResults!.results.push(mockAttachedResult1);

      expect(controller.state).toEqual([mockAttachedResult1]);
      expect(controller.isAttached(mockResult1)).toBe(true);

      // Verify attach action was called
      controller.attach(mockResult1);
      expect(attachResult).toHaveBeenCalled();

      // Verify detach action is called
      controller.detach(mockResult1);
      expect(detachResult).toHaveBeenCalled();
    });

    it('should handle multiple results for the same record', () => {
      const mockAttachedResult1 = createMockAttachedResult({
        caseId: recordId,
        permanentId: 'perm-id-1',
      });
      const mockAttachedResult2 = createMockAttachedResult({
        caseId: recordId,
        permanentId: 'perm-id-2',
      });
      engine.state.attachedResults!.results.push(
        mockAttachedResult1,
        mockAttachedResult2
      );

      expect(controller.state).toHaveLength(2);
      expect(controller.isAttached(mockResult1)).toBe(true);
      expect(controller.isAttached(mockResult2)).toBe(true);
    });

    it('should maintain isolation between different record instances', () => {
      const otherController = buildAttachedResults(engine, {
        options: {recordId: otherRecordId},
      });

      const mockAttachedResult1 = createMockAttachedResult({
        caseId: recordId,
        permanentId: 'perm-id-1',
      });
      const mockAttachedResultOtherRecord = createMockAttachedResult({
        caseId: otherRecordId,
        permanentId: 'perm-id-3',
      });
      engine.state.attachedResults!.results.push(
        mockAttachedResult1,
        mockAttachedResultOtherRecord
      );

      // Each controller should only see its own record's results
      expect(controller.state).toEqual([mockAttachedResult1]);
      expect(otherController.state).toEqual([mockAttachedResultOtherRecord]);

      expect(controller.isAttached(mockResult1)).toBe(true);
      expect(otherController.isAttached(mockResult1)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty recordId gracefully', () => {
      const controllerWithEmptyRecordId = buildAttachedResults(engine, {
        options: {recordId: ''},
      });

      expect(controllerWithEmptyRecordId.isAttached(mockResult1)).toBe(false);
    });

    it('should handle results with special characters in identifiers', () => {
      const specialResult = buildMockResult({
        raw: {
          permanentid: 'perm-id-with-$pecial-chars!@#',
          urihash: 'uri-hash-with-$pecial-chars!@#',
          source: 'test',
        },
      });

      const specialAttachedResult = createMockAttachedResult({
        caseId: recordId,
        permanentId: 'perm-id-with-$pecial-chars!@#',
        uriHash: 'uri-hash-with-$pecial-chars!@#',
      });
      engine.state.attachedResults!.results.push(specialAttachedResult);

      expect(controller.isAttached(specialResult)).toBe(true);
    });
  });
});
