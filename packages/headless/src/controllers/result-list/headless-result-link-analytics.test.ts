import {Result} from '../../api/search/search/result';
import {logDocumentOpenThunk} from '../../features/result/result-analytics-actions';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockResult} from '../../test';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {
  buildResultLinkAnalytics,
  ResultLinkAnalytics,
} from './headless-result-link-analytics';

describe('ResultLinkAnalytics', () => {
  let mockEngine: MockEngine<SearchAppState>;
  let mockResult: Result;
  let resultLinkAnalytics: ResultLinkAnalytics;
  let logDocumentOpenPendingActionType: string;
  function initializeResultLinkAnalytics(delay?: number) {
    const result = (mockResult = buildMockResult());
    logDocumentOpenPendingActionType = logDocumentOpenThunk(mockResult).pending
      .type;
    resultLinkAnalytics = buildResultLinkAnalytics(mockEngine, {
      options: {result, delay},
    });
  }

  function findLogDocumentAction() {
    return (
      mockEngine.actions.find(
        (action) => action.type === logDocumentOpenPendingActionType
      ) ?? null
    );
  }

  function expectLogDocumentActionPending() {
    const action = findLogDocumentAction();
    expect(action).toEqual(
      logDocumentOpenThunk(mockResult).pending(action!.meta.requestId)
    );
  }

  function expectLogDocumentActionNotPending() {
    const action = findLogDocumentAction();
    expect(action).toBeNull();
  }

  beforeEach(() => {
    mockEngine = buildMockSearchAppEngine();
    initializeResultLinkAnalytics();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('when calling select(), logs documentOpen', () => {
    resultLinkAnalytics.select();
    expectLogDocumentActionPending();
  });

  describe('with a delay', () => {
    const selectDelay = 2;
    beforeEach(() => {
      initializeResultLinkAnalytics(selectDelay);
    });

    it("when calling beginDelayedSelect(), doesn't log documentOpen before the delay", () => {
      resultLinkAnalytics.beginDelayedSelect();
      jest.advanceTimersByTime(selectDelay - 1);
      expectLogDocumentActionNotPending();
    });

    it('when calling beginDelayedSelect(), logs documentOpen after the delay', () => {
      resultLinkAnalytics.beginDelayedSelect();
      jest.advanceTimersByTime(selectDelay);
      expectLogDocumentActionPending();
    });

    it("when calling beginDelayedSelect(), doesn't log documentOpen after the delay if cancelPendingSelect() was called", () => {
      resultLinkAnalytics.beginDelayedSelect();
      jest.advanceTimersByTime(selectDelay - 1);
      resultLinkAnalytics.cancelPendingSelect();
      jest.advanceTimersByTime(1);
      expectLogDocumentActionNotPending();
    });
  });
});
