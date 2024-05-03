import {Result} from '../../api/search/search/result';
import {configuration} from '../../app/common-reducers';
import {pushRecentResult} from '../../features/recent-results/recent-results-actions';
import {logDocumentOpen} from '../../features/result/result-analytics-actions';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {buildMockResult} from '../../test/mock-result';
import {createMockState} from '../../test/mock-state';
import {
  buildInteractiveResult,
  InteractiveResult,
} from './headless-interactive-result';

jest.mock('../../features/recent-results/recent-results-actions');
jest.mock('../../features/result/result-analytics-actions');

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
    const result = (mockResult = buildMockResult(resultStringParams));
    interactiveResult = buildInteractiveResult(engine, {
      options: {result, selectionDelay: delay},
    });
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
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
    expect(logDocumentOpen).toHaveBeenCalledWith(mockResult);
  });
});
