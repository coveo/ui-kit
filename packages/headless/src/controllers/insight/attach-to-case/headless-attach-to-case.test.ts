import {attachedResults, configuration} from '../../../app/reducers';
import {
  attachResult,
  detachResult,
} from '../../../features/attached-results/attached-results-actions';
import {InsightAppState} from '../../../state/insight-app-state';
import {createMockAttachedResult} from '../../../test/mock-attached-results';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {buildMockRaw} from '../../../test/mock-raw';
import {buildMockResult} from '../../../test/mock-result';
import {
  AttachToCase,
  buildAttachToCase,
  SearchResult,
} from './headless-attach-to-case';

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
    const testPermanentId = 'test_permanentid';
    const mockAttachedResult = createMockAttachedResult({
      permanentId: testPermanentId,
      uriHash: undefined,
    });
    engine.state.attachedResults.results.push(mockAttachedResult);

    const mockSearchResult = buildMockResult({
      raw: buildMockRaw({
        permanentid: testPermanentId,
      }),
    });
    expect(attachToCase.isAttached(mockSearchResult)).toBeTruthy();
  });

  it('calling #isAttached should return true if the result is attached with the uriHash.', () => {
    const testUriHash = 'test_urihash';
    const mockAttachedResult = createMockAttachedResult({
      uriHash: testUriHash,
      permanentId: undefined,
    });
    engine.state.attachedResults.results.push(mockAttachedResult);

    const mockSearchResult = buildMockResult({
      raw: buildMockRaw({
        urihash: testUriHash,
      }),
    });
    expect(attachToCase.isAttached(mockSearchResult)).toBeTruthy();
  });

  it('calling #isAttached should return false if the result is not attached.', () => {
    const testPermanentId = 'test_permanentId';
    const otherPermanentId = 'other_permanentId';
    const mockAttachedResult = createMockAttachedResult({
      permanentId: testPermanentId,
      uriHash: undefined,
    });
    engine.state.attachedResults.results.push(mockAttachedResult);

    const mockSearchResult = buildMockResult({
      raw: buildMockRaw({
        permanentid: otherPermanentId,
      }),
    });
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
