import type {Result} from '../../api/search/search/result.js';
import {configuration} from '../../app/common-reducers.js';
import {logRecentResultClick} from '../../features/recent-results/recent-results-analytics-actions.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockResult} from '../../test/mock-result.js';
import {createMockState} from '../../test/mock-state.js';
import {
  buildInteractiveRecentResult,
  type InteractiveRecentResult,
} from './headless-interactive-recent-result.js';

vi.mock('../../features/recent-results/recent-results-analytics-actions');

describe('InteractiveRecentResult', () => {
  let engine: MockedSearchEngine;
  let mockResult: Result;
  let interactiveRecentResult: InteractiveRecentResult;

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
    mockResult = buildMockResult(resultStringParams);
    const result = mockResult;
    interactiveRecentResult = buildInteractiveRecentResult(engine, {
      options: {result, selectionDelay: delay},
    });
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    initializeInteractiveRecentResult();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select(), logs recentResultClick', () => {
    interactiveRecentResult.select();
    vi.runAllTimers();

    expect(logRecentResultClick).toHaveBeenCalledWith(mockResult);
  });
});
