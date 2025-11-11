import {configuration} from '../../../app/common-reducers.js';
import {
  attachResult,
  detachResult,
} from '../../../features/attached-results/attached-results-actions.js';
import {
  logCaseAttach,
  logCaseDetach,
} from '../../../features/attached-results/attached-results-analytics-actions.js';
import {attachedResultsReducer} from '../../../features/attached-results/attached-results-slice.js';
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
  type AttachedResultsOptions,
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

describe('attached results', () => {
  let engine: MockedInsightEngine;
  let controller: AttachedResults;
  const testCaseId = '12345';
  const testPermanentId = 'testPermanentId';
  const testUriHash = 'testUriHash';

  const payload = buildMockResult({
    raw: {
      permanentid: testPermanentId,
      urihash: testUriHash,
    },
  });

  const exampleOptions: AttachedResultsOptions = {
    caseId: testCaseId,
  };

  function initAttachedResults(options = exampleOptions) {
    engine = buildMockInsightEngine(buildMockInsightState());
    controller = buildAttachedResults(engine, {options});
  }

  beforeEach(() => {
    initAttachedResults();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes', () => {
    expect(controller).toBeTruthy();
  });

  it('it adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      attachedResults: attachedResultsReducer,
    });
  });

  it('exposes a subscribe method', () => {
    expect(controller.subscribe).toBeTruthy();
  });

  describe('#isAttached', () => {
    describe('when no results are attached', () => {
      it('calling #isAttached should return false', () => {
        expect(controller.isAttached(payload)).toBe(false);
      });
    });

    describe('when the result is attached', () => {
      it('#isAttached should return true', () => {
        const mockAttachedResult = createMockAttachedResult({
          caseId: testCaseId,
          permanentId: testPermanentId,
          uriHash: undefined,
        });
        engine.state.attachedResults!.results.push(mockAttachedResult);

        expect(controller.isAttached(payload)).toBe(true);
      });

      it('#isAttached should return true even when multiple results are attached', () => {
        [testPermanentId, 'foo', 'bar'].forEach((permId) => {
          const mockAttachedResult = createMockAttachedResult({
            caseId: testCaseId,
            permanentId: permId,
            uriHash: undefined,
          });
          engine.state.attachedResults!.results.push(mockAttachedResult);
        });

        expect(controller.isAttached(payload)).toBe(true);
      });

      it('#isAttached should return true when caseId and uriHash match but permanentId is undefined', () => {
        const mockAttachedResult = createMockAttachedResult({
          caseId: testCaseId,
          permanentId: undefined,
          uriHash: testUriHash,
        });
        engine.state.attachedResults!.results.push(mockAttachedResult);

        expect(controller.isAttached(payload)).toBe(true);
      });
    });

    describe('when the result is not attached', () => {
      it('#isAttached should return false when caseId does not match but permanentId matches', () => {
        const mockAttachedResult = createMockAttachedResult({
          caseId: 'differentCaseId',
          permanentId: testPermanentId,
          uriHash: undefined,
        });
        engine.state.attachedResults!.results.push(mockAttachedResult);

        expect(controller.isAttached(payload)).toBe(false);
      });

      it('#isAttached should return false when caseId does not match but uriHash matches', () => {
        const mockAttachedResult = createMockAttachedResult({
          caseId: 'differentCaseId',
          permanentId: undefined,
          uriHash: testUriHash,
        });
        engine.state.attachedResults!.results.push(mockAttachedResult);

        expect(controller.isAttached(payload)).toBe(false);
      });

      it('#isAttached should return false', () => {
        ['foo', 'bar'].forEach((permId) => {
          const mockAttachedResult = createMockAttachedResult({
            caseId: testCaseId,
            permanentId: permId,
            uriHash: undefined,
          });
          engine.state.attachedResults!.results.push(mockAttachedResult);
        });

        expect(controller.isAttached(payload)).toBe(false);
      });
    });
  });

  describe('#attach', () => {
    const testResult = buildMockResult({
      clickUri: 'foo.bar',
      title: 'test result',
      raw: {
        permanentid: testPermanentId,
        urihash: testUriHash,
      },
    });

    it('calling #attach should trigger the #attachResult action with the correct payload', () => {
      controller.attach(testResult);
      const attachedResult = buildAttachedResultFromSearchResult(
        testResult,
        testCaseId
      );

      expect(attachResult).toHaveBeenCalledTimes(1);
      expect(attachResult).toHaveBeenCalledWith(attachedResult);
    });

    it('calling #attach should trigger the #logCaseAttach usage analytics action', () => {
      controller.attach(testResult);

      expect(logCaseAttach).toHaveBeenCalledTimes(1);
      expect(logCaseAttach).toHaveBeenCalledWith(testResult);
    });
  });

  describe('#detach', () => {
    const testResult = buildMockResult({
      clickUri: 'foo.bar',
      title: 'test result',
      raw: {
        permanentid: testPermanentId,
        urihash: testUriHash,
      },
    });

    it('calling #detach should trigger the #detachResult with the correct payload', () => {
      controller.detach(testResult);
      const resultToDetach = buildAttachedResultFromSearchResult(
        testResult,
        testCaseId
      );

      expect(detachResult).toHaveBeenCalledTimes(1);
      expect(detachResult).toHaveBeenCalledWith(resultToDetach);
    });

    it('calling #detach should trigger the #logCaseDetach usage analytics action', () => {
      controller.detach(testResult);

      expect(logCaseDetach).toHaveBeenCalledTimes(1);
      expect(logCaseDetach).toHaveBeenCalledWith(testResult);
    });
  });
});
