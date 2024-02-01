import {Result} from '../../api/search/search/result';
import {configuration} from '../../app/common-reducers';
import {logRecentResultClick} from '../../features/recent-results/recent-results-analytics-actions';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {buildMockResult} from '../../test/mock-result';
import {
  buildInteractiveRecentResult,
  InteractiveRecentResult,
} from './headless-interactive-recent-result';

describe('InteractiveRecentResult', () => {
  let engine: MockSearchEngine;
  let mockResult: Result;
  let interactiveRecentResult: InteractiveRecentResult;
  let logRecentResultClickPendingActionType: string;

  const resultStringParams = {
    title: 'title',
    uri: 'uri',
    printableUri: 'printable-uri',
    clickUri: 'click-uri',
    uniqueId: 'unique-id',
    excerpt: 'excerpt',
    firstSentences: 'first-sentences',
    flags: 'flags',
  };

  function initializeInteractiveRecentResult(delay?: number) {
    const result = (mockResult = buildMockResult(resultStringParams));
    logRecentResultClickPendingActionType =
      logRecentResultClick(mockResult).pending.type;
    interactiveRecentResult = buildInteractiveRecentResult(engine, {
      options: {result, selectionDelay: delay},
    });
  }

  function findLogRecentResultClickAction() {
    return (
      engine.actions.find(
        (action) => action.type === logRecentResultClickPendingActionType
      ) ?? null
    );
  }

  function expectLogRecentResultActionPending() {
    const action = findLogRecentResultClickAction();
    expect(action).toEqual(
      logRecentResultClick(mockResult).pending(action!.meta.requestId)
    );
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    initializeInteractiveRecentResult();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select(), logs recentResultClick', () => {
    interactiveRecentResult.select();
    jest.runAllTimers();

    expectLogRecentResultActionPending();
  });
});
