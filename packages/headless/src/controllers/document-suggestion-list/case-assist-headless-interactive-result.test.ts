import {Result} from '../../api/search/search/result';
import {configuration} from '../../app/common-reducers';
import {logDocumentSuggestionOpen} from '../../features/case-assist/case-assist-analytics-actions';
import {buildMockResult} from '../../test';
import {
  buildMockCaseAssistEngine,
  MockCaseAssistEngine,
} from '../../test/mock-engine';
import {
  buildCaseAssistInteractiveResult,
  CaseAssistInteractiveResult,
} from './case-assist-headless-interactive-result';

describe('InteractiveResult', () => {
  let engine: MockCaseAssistEngine;
  let mockResult: Result;
  let interactiveResult: CaseAssistInteractiveResult;
  let logDocumentOpenPendingActionType: string;

  const resultStringParams = {
    uniqueId: 'unique-id',
  };

  function initializeInteractiveResult(delay?: number) {
    const result = (mockResult = buildMockResult(resultStringParams));
    logDocumentOpenPendingActionType = logDocumentSuggestionOpen(
      mockResult.uniqueId
    ).pending.type;
    interactiveResult = buildCaseAssistInteractiveResult(engine, {
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
      logDocumentSuggestionOpen(mockResult.uniqueId).pending(
        action!.meta.requestId
      )
    );
  }

  beforeEach(() => {
    engine = buildMockCaseAssistEngine();
    initializeInteractiveResult();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select(), logs documentOpen', () => {
    interactiveResult.select();
    expectLogDocumentActionPending();
  });
});
