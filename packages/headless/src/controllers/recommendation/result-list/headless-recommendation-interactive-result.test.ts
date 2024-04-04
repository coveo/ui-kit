import {Result} from '../../../api/search/search/result';
import {configuration} from '../../../app/common-reducers';
import {logRecommendationOpen} from '../../../features/recommendation/recommendation-analytics-actions';
import {buildMockResult} from '../../../test';
import {
  buildMockRecommendationAppEngine,
  MockRecommendationEngine,
} from '../../../test/mock-engine';
import {
  buildInteractiveResult,
  InteractiveResult,
} from './headless-recommendation-interactive-result';

describe('RecommendationInteractiveResult', () => {
  let engine: MockRecommendationEngine;
  let mockResult: Result;
  let interactiveResult: InteractiveResult;
  let logRecommendationOpenPendingActionType: string;

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

  function initializeInteractiveResult(delay?: number) {
    const result = (mockResult = buildMockResult(resultStringParams));
    logRecommendationOpenPendingActionType =
      logRecommendationOpen(mockResult).pending.type;
    interactiveResult = buildInteractiveResult(engine, {
      options: {result, selectionDelay: delay},
    });
  }

  function findLogRecommendationAction() {
    return (
      engine.actions.find(
        (action) => action.type === logRecommendationOpenPendingActionType
      ) ?? null
    );
  }

  function expectLogRecommendationActionPending() {
    const action = findLogRecommendationAction();
    expect(action).toEqual(
      logRecommendationOpen(mockResult).pending(action!.meta.requestId)
    );
  }

  beforeEach(() => {
    engine = buildMockRecommendationAppEngine();
    initializeInteractiveResult();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select(), logs recommendationOpen', () => {
    interactiveResult.select();
    expectLogRecommendationActionPending();
  });
});
