import {attachedResults, configuration} from '../../../app/reducers';
import {
  attachResult,
  detachResult,
} from '../../../features/attached-results/attached-results-actions';
import {AttachedResult} from '../../../features/attached-results/attached-results-state';
import {InsightAppState} from '../../../state/insight-app-state';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {
  AttachToCase,
  buildAttachToCase,
  SearchResult,
} from './headless-attach-to-case';

function createMockAttachedResult(
  permanentId = 'foo',
  caseId = '12345'
): AttachedResult {
  return {
    caseId: caseId,
    permanentId: permanentId,
    resultUrl: 'foo.com',
    source: 'bar',
    title: 'foo',
  };
}

describe('insight attach to case', () => {
  let engine: MockInsightEngine;
  let state: InsightAppState;
  let attachToCase: AttachToCase;

  function initController() {
    engine = buildMockInsightEngine();
    engine.state = state;
    attachToCase = buildAttachToCase(engine);
  }

  beforeEach(() => {
    state = buildMockInsightState();
    initController();
  });

  it('it adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      attachedResults,
    });
  });

  it('calling #isAttached should return false if there are no results attached.', () => {
    const mockSearchResult: SearchResult = {
      title: '',
      raw: {
        permanentid: 'foo',
        urihash: undefined,
      },
    };
    expect(attachToCase.isAttached(mockSearchResult)).toBeFalsy();
  });

  it('calling #isAttached should return true if the result is attached with the permanentId.', () => {
    const mockAttachedResult = createMockAttachedResult();
    engine.state.attachedResults.results.push(mockAttachedResult);

    const mockSearchResult: SearchResult = {
      title: '',
      raw: {
        permanentid: 'foo',
        urihash: undefined,
      },
    };
    expect(attachToCase.isAttached(mockSearchResult)).toBeTruthy();
  });

  it('calling #isAttached should return true if the result is attached with the uriHash.', () => {
    const mockAttachedResult = createMockAttachedResult();
    engine.state.attachedResults.results.push({
      ...mockAttachedResult,
      permanentId: undefined,
      uriHash: 'foo',
    });

    const mockSearchResult: SearchResult = {
      title: '',
      raw: {
        permanentid: undefined,
        urihash: 'foo',
      },
    };
    expect(attachToCase.isAttached(mockSearchResult)).toBeTruthy();
  });

  it('calling #isAttached should return false if the result is not attached.', () => {
    const mockAttachedResult = createMockAttachedResult();
    engine.state.attachedResults.results.push(mockAttachedResult);

    const mockSearchResult: SearchResult = {
      title: '',
      raw: {
        permanentid: 'NOT FOO',
        urihash: undefined,
      },
    };
    expect(attachToCase.isAttached(mockSearchResult)).toBeFalsy();
  });

  it('calling #attach should trigger the attachResult action with the correct payload', () => {
    const mockAttachedResult = createMockAttachedResult();
    attachToCase.attach(mockAttachedResult);

    expect(engine.actions).toContainEqual(
      attachResult({result: mockAttachedResult})
    );
  });

  it('calling #detach should trigger the detachResult action with the correct payload', () => {
    const mockAttachedResult = createMockAttachedResult();
    attachToCase.detach(mockAttachedResult);

    expect(engine.actions).toContainEqual(
      detachResult({result: mockAttachedResult})
    );
  });
});
