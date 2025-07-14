import type {Result} from '../../api/search/search/result.js';
import {configuration} from '../../app/common-reducers.js';
import {pushRecentResult} from '../../features/recent-results/recent-results-actions.js';
import {logDocumentOpen} from '../../features/result/result-analytics-actions.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockResult} from '../../test/mock-result.js';
import {createMockState} from '../../test/mock-state.js';
import {
  buildInteractiveResult,
  type InteractiveResult,
} from './headless-interactive-result.js';

vi.mock('../../features/recent-results/recent-results-actions');
vi.mock('../../features/result/result-analytics-actions');

describe('InteractiveResult', () => {
  let engine: MockedSearchEngine;
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

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
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
    expect(logDocumentOpen).toHaveBeenCalledWith(mockResult);
  });
});
