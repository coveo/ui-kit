import {Result} from '../../api/search/search/result';
import {configuration} from '../../app/reducers';
import {logDocumentOpenThunk} from '../../features/result/result-analytics-actions';
import {buildMockResult} from '../../test';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {
  buildInteractiveResult,
  InteractiveResult,
} from './headless-interactive-result';

describe('InteractiveResult', () => {
  let engine: MockSearchEngine;
  let mockResult: Result;
  let interactiveResult: InteractiveResult;
  let logDocumentOpenPendingActionType: string;
  function initializeInteractiveResult(delay?: number) {
    const result = (mockResult = buildMockResult());
    logDocumentOpenPendingActionType = logDocumentOpenThunk(mockResult).pending
      .type;
    interactiveResult = buildInteractiveResult(engine, {
      options: {result, selectionDelay: delay},
    });
  }

  function findLogDocumentAction() {
    return (
      engine.actions.find(
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
    engine = buildMockSearchAppEngine();
    initializeInteractiveResult();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select(), logs documentOpen', () => {
    interactiveResult.select();
    expectLogDocumentActionPending();
  });

  describe('with a delay', () => {
    const selectDelay = 2;
    beforeEach(() => {
      initializeInteractiveResult(selectDelay);
    });

    it("when calling beginDelayedSelect(), doesn't log documentOpen before the delay", () => {
      interactiveResult.beginDelayedSelect();
      jest.advanceTimersByTime(selectDelay - 1);
      expectLogDocumentActionNotPending();
    });

    it('when calling beginDelayedSelect(), logs documentOpen after the delay', () => {
      interactiveResult.beginDelayedSelect();
      jest.advanceTimersByTime(selectDelay);
      expectLogDocumentActionPending();
    });

    it("when calling beginDelayedSelect(), doesn't log documentOpen after the delay if cancelPendingSelect() was called", () => {
      interactiveResult.beginDelayedSelect();
      jest.advanceTimersByTime(selectDelay - 1);
      interactiveResult.cancelPendingSelect();
      jest.advanceTimersByTime(1);
      expectLogDocumentActionNotPending();
    });
  });
});
