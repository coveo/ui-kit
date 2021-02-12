import {Result} from '../../api/search/search/result';
import {logDocumentOpenThunk} from '../../features/result/result-analytics-actions';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockResult} from '../../test';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {buildResultLink, ResultLink} from './headless-result-link';

describe('ResultLink', () => {
  let mockEngine: MockEngine<SearchAppState>;
  let mockResult: Result;
  let resultLink: ResultLink;
  let logDocumentOpenPendingActionType: string;
  function initializeResultLink(delay?: number) {
    const result = (mockResult = buildMockResult());
    logDocumentOpenPendingActionType = logDocumentOpenThunk(mockResult).pending
      .type;
    resultLink = buildResultLink(mockEngine, {
      options: {result, selectionDelay: delay},
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
    initializeResultLink();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('when calling select(), logs documentOpen', () => {
    resultLink.select();
    expectLogDocumentActionPending();
  });

  describe('with a delay', () => {
    const selectDelay = 2;
    beforeEach(() => {
      initializeResultLink(selectDelay);
    });

    it("when calling beginDelayedSelect(), doesn't log documentOpen before the delay", () => {
      resultLink.beginDelayedSelect();
      jest.advanceTimersByTime(selectDelay - 1);
      expectLogDocumentActionNotPending();
    });

    it('when calling beginDelayedSelect(), logs documentOpen after the delay', () => {
      resultLink.beginDelayedSelect();
      jest.advanceTimersByTime(selectDelay);
      expectLogDocumentActionPending();
    });

    it("when calling beginDelayedSelect(), doesn't log documentOpen after the delay if cancelPendingSelect() was called", () => {
      resultLink.beginDelayedSelect();
      jest.advanceTimersByTime(selectDelay - 1);
      resultLink.cancelPendingSelect();
      jest.advanceTimersByTime(1);
      expectLogDocumentActionNotPending();
    });
  });
});
