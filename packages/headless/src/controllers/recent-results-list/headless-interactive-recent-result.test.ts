import {Result} from '../../api/search/search/result';
import {configuration} from '../../app/common-reducers';
import {logRecentResultClick} from '../../features/recent-results/recent-results-analytics-actions';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {buildMockResult} from '../../test/mock-result';
import {createMockState} from '../../test/mock-state';
import {
  buildInteractiveRecentResult,
  InteractiveRecentResult,
} from './headless-interactive-recent-result';

jest.mock('../../features/recent-results/recent-results-analytics-actions');

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
    const result = (mockResult = buildMockResult(resultStringParams));
    interactiveRecentResult = buildInteractiveRecentResult(engine, {
      options: {result, selectionDelay: delay},
    });
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
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

    expect(logRecentResultClick).toHaveBeenCalledWith(mockResult);
  });
});
