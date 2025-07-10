import type {Result} from '../../../api/search/search/result.js';
import {configuration} from '../../../app/common-reducers.js';
import {pushRecentResult} from '../../../features/recent-results/recent-results-actions.js';
import {logDocumentOpen} from '../../../features/result/result-insight-analytics-actions.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {buildMockResult} from '../../../test/mock-result.js';
import {
  buildInteractiveResult,
  type InteractiveResult,
} from './headless-insight-interactive-result.js';

vi.mock('../../../features/result/result-insight-analytics-actions');
vi.mock('../../../features/recent-results/recent-results-actions');

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
    mockResult = buildMockResult(resultStringParams);
    const result = mockResult;
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
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select() should add the result to recent results list', () => {
    interactiveResult.select();
    vi.runAllTimers();

    expect(pushRecentResult).toHaveBeenCalled();
  });

  it('when calling select(), logs documentOpen', () => {
    interactiveResult.select();
    expectLogDocumentActionPending();
  });
});
