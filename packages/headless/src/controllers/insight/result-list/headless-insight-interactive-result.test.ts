import {Result} from '../../../api/search/search/result';
import {configuration} from '../../../app/common-reducers';
import {pushRecentResult} from '../../../features/recent-results/recent-results-actions';
import {logDocumentOpen} from '../../../features/result/result-insight-analytics-actions';
import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {buildMockResult} from '../../../test/mock-result';
import {
  buildInteractiveResult,
  InteractiveResult,
} from './headless-insight-interactive-result';

jest.mock('../../../features/result/result-insight-analytics-actions');
jest.mock('../../../features/recent-results/recent-results-actions');

describe('InsightInteractiveResult', () => {
  let engine: MockedInsightEngine;
  let mockResult: Result;
  let interactiveResult: InteractiveResult;

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
    interactiveResult = buildInteractiveResult(engine, {
      options: {result, selectionDelay: delay},
    });
  }

  function expectLogDocumentActionPending() {
    expect(logDocumentOpen).toHaveBeenCalledWith(mockResult);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine(buildMockInsightState());
    initializeInteractiveResult();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select() should add the result to recent results list', () => {
    interactiveResult.select();
    jest.runAllTimers();

    expect(pushRecentResult).toHaveBeenCalled();
  });

  it('when calling select(), logs documentOpen', () => {
    interactiveResult.select();
    expectLogDocumentActionPending();
  });
});
