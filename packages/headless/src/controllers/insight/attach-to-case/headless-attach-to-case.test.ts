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
import type {InsightAppState} from '../../../state/insight-app-state.js';
import {createMockAttachedResult} from '../../../test/mock-attached-results.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {buildMockResult} from '../../../test/mock-result.js';
import {
  type AttachToCase,
  type AttachToCaseOptions,
  buildAttachToCase,
} from './headless-attach-to-case.js';

vi.mock(
  '../../../features/attached-results/attached-results-analytics-actions',
  () => ({
    logCaseAttach: vi.fn(() => () => {}),
    logCaseDetach: vi.fn(() => () => {}),
  })
);

vi.mock('../../../features/attached-results/attached-results-actions');

describe('insight attach to case', () => {
  let engine: MockedInsightEngine;
  let defaultOptions: AttachToCaseOptions;
  let state: InsightAppState;
  let attachToCase: AttachToCase;

  function initAttachToCase(options = defaultOptions) {
    engine = buildMockInsightEngine(buildMockInsightState());
    engine.state = state;
    attachToCase = buildAttachToCase(engine, {options});
  }

  beforeEach(() => {
    state = buildMockInsightState();
    defaultOptions = {
      result: buildMockResult(),
      caseId: 'defaultCaseId',
    };
    initAttachToCase();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes', () => {
    expect(attachToCase).toBeTruthy();
  });

  it('it adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      attachedResults,
    });
  });

  it('exposes a subscribe method', () => {
    expect(attachToCase.subscribe).toBeTruthy();
  });

  describe('#isAttached', () => {
    describe('when no results are attached', () => {
      it('calling #isAttached should return false', () => {
        expect(attachToCase.isAttached()).toBe(false);
      });
    });

    describe('when the result is attached', () => {
      const testPermanentId = 'testPermanentId';
      const testUriHash = 'testUriHash';
      const testCaseId = '12345';

      beforeEach(() => {
        defaultOptions = {
          result: buildMockResult({
            raw: {
              permanentid: testPermanentId,
              urihash: testUriHash,
            },
          }),
          caseId: testCaseId,
        };
        initAttachToCase({...defaultOptions});
      });

      it('#isAttached should return true', () => {
        const mockAttachedResult = createMockAttachedResult({
          permanentId: testPermanentId,
          uriHash: undefined,
        });
        engine.state.attachedResults!.results.push(mockAttachedResult);

        expect(attachToCase.isAttached()).toBe(true);
      });

      it('#isAttached should return true even when multiple results are attached', () => {
        [testPermanentId, 'foo', 'bar'].forEach((permId) => {
          const mockAttachedResult = createMockAttachedResult({
            permanentId: permId,
            uriHash: undefined,
          });
          engine.state.attachedResults!.results.push(mockAttachedResult);
        });

        expect(attachToCase.isAttached()).toBe(true);
      });
    });

    describe('when the result is not attached', () => {
      const testPermanentId = 'testPermanentId';
      const testUriHash = 'testUriHash';
      const testCaseId = '12345';

      beforeEach(() => {
        defaultOptions = {
          result: buildMockResult({
            raw: {
              permanentid: testPermanentId,
              urihash: testUriHash,
            },
          }),
          caseId: testCaseId,
        };
        initAttachToCase({...defaultOptions});
      });

      it('#isAttached should return false', () => {
        ['foo', 'bar'].forEach((permId) => {
          const mockAttachedResult = createMockAttachedResult({
            permanentId: permId,
            uriHash: undefined,
          });
          engine.state.attachedResults!.results.push(mockAttachedResult);
        });

        expect(attachToCase.isAttached()).toBe(false);
      });
    });
  });

  describe('#attach', () => {
    const testPermanentId = 'testPermanentId';
    const testUriHash = 'testUriHash';
    const testCaseId = '12345';
    const testResult = buildMockResult({
      clickUri: 'foo.bar',
      title: 'test result',
      raw: {
        permanentid: testPermanentId,
        urihash: testUriHash,
      },
    });

    beforeEach(() => {
      defaultOptions = {
        result: testResult,
        caseId: testCaseId,
      };
      initAttachToCase({...defaultOptions});
    });

    it('calling #attach should trigger the #attachResult action with the correct payload', () => {
      attachToCase.attach();
      const attachedResult = buildAttachedResultFromSearchResult(
        testResult,
        testCaseId
      );

      expect(attachResult).toHaveBeenCalledTimes(1);
      expect(attachResult).toHaveBeenCalledWith(attachedResult);
    });

    it('calling #attach should trigger the #logCaseAttach usage analytics action', () => {
      attachToCase.attach();

      expect(logCaseAttach).toHaveBeenCalledTimes(1);
      expect(logCaseAttach).toHaveBeenCalledWith(testResult);
    });
  });

  describe('#detach', () => {
    const testPermanentId = 'testPermanentId';
    const testUriHash = 'testUriHash';
    const testCaseId = '12345';
    const testResult = buildMockResult({
      clickUri: 'foo.bar',
      title: 'test result',
      raw: {
        permanentid: testPermanentId,
        urihash: testUriHash,
      },
    });

    beforeEach(() => {
      defaultOptions = {
        result: testResult,
        caseId: testCaseId,
      };
      initAttachToCase({...defaultOptions});
    });

    it('calling #detach should trigger the #detachResult with the correct payload', () => {
      attachToCase.detach();
      const resultToDetach = buildAttachedResultFromSearchResult(
        testResult,
        testCaseId
      );

      expect(detachResult).toHaveBeenCalledTimes(1);
      expect(detachResult).toHaveBeenCalledWith(resultToDetach);
    });

    it('calling #detach should trigger the #logCaseDetach usage analytics action', () => {
      attachToCase.detach();

      expect(logCaseDetach).toHaveBeenCalledTimes(1);
      expect(logCaseDetach).toHaveBeenCalledWith(testResult);
    });
  });
});
